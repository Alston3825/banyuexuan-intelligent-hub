#!/usr/bin/env python3
"""Server-side isolated restore test; ephemeral data key via stdin, never logged/stored."""
import base64,datetime as dt,hashlib,json,os,pathlib,subprocess,sys,tarfile,tempfile
from cryptography.hazmat.primitives.ciphers import Cipher,algorithms,modes
ROOT=pathlib.Path('/opt/banyuexuan-backup');payload=json.load(sys.stdin);ident=payload['snapshot']
if not ident.isalnum():raise ValueError('Invalid snapshot id')
folder=ROOT/'outbox'/ident;manifest=json.loads((folder/'manifest.json').read_text())
db='byx_restore_'+dt.datetime.now(dt.timezone.utc).strftime('%Y%m%d_%H%M%S')
def psql(database,data):
 return subprocess.run(['docker','exec','-i','xiaoyue-postgres','psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','xiaoyue','-d',database],input=data,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
os.umask(0o077)
try:
 with tempfile.TemporaryDirectory(prefix='restore-probe-',dir=ROOT/'state') as tmp:
  root=pathlib.Path(tmp);encfile=root/'snapshot.enc'
  with encfile.open('wb') as out:
   for part in manifest['parts']:
    f=folder/part['name'];data=f.read_bytes()
    if len(data)!=part['bytes'] or hashlib.sha256(data).hexdigest()!=part['sha256']:raise ValueError('Part verification failed')
    out.write(data)
  if hashlib.sha256(encfile.read_bytes()).hexdigest()!=manifest['encrypted_sha256']:raise ValueError('Whole ciphertext verification failed')
  with encfile.open('rb') as src:
   aad=base64.b64decode(payload['aad']);src.seek(len(aad));start=src.tell();src.seek(-16,2);end=src.tell();tag=src.read(16);src.seek(start)
   dec=Cipher(algorithms.AES(base64.b64decode(payload['key'])),modes.GCM(base64.b64decode(payload['nonce']),tag)).decryptor();dec.authenticate_additional_data(aad)
   tarpath=root/'snapshot.tar.gz'
   with tarpath.open('wb') as out:
    remaining=end-start
    while remaining:
     data=src.read(min(1024*1024,remaining));remaining-=len(data);out.write(dec.update(data))
    out.write(dec.finalize())
  with tarfile.open(tarpath,'r:gz') as tar:
   for name in ['database/pre-data.sql','database/post-data.sql','database/rows.jsonl']:
    member=tar.getmember(name)
    if not member.isfile():raise ValueError('Unexpected archive member')
    (root/pathlib.Path(name).name).write_bytes(tar.extractfile(member).read())
  psql('xiaoyue',('CREATE DATABASE '+db+';').encode())
  psql(db,(root/'pre-data.sql').read_bytes())
  subprocess.run(['python3',str(ROOT/'repo/scripts/restore_rows.py'),str(root/'rows.jsonl'),'--database',db],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
  psql(db,(root/'post-data.sql').read_bytes())
  records=[json.loads(l) for l in (root/'rows.jsonl').read_text().splitlines() if l.strip()];counts={}
  for record in records:counts[record['table']]=counts.get(record['table'],0)+1
  for table,expected in counts.items():
   actual=int(psql(db,('SELECT count(*) FROM '+table+';').encode()).strip())
   if actual!=expected:raise ValueError('Restored row count mismatch')
  other=int(psql(db,b"SELECT count(*) FROM xiaoyue.messages WHERE conversation_id IS DISTINCT FROM 'wrPPybcQAAh0UjrU0aSK-BdQpYi9kdFg';").strip())
  if other:raise ValueError('Out of scope records')
  result={'snapshot':ident,'status':'passed','database':db,'table_counts':counts,'foreign_keys_and_indexes_restored':True,'cross_group_messages':other,'utc':dt.datetime.now(dt.timezone.utc).isoformat()}
  (ROOT/'state/restore-test.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
except Exception as e:
 print('Restore probe failed: '+type(e).__name__,file=sys.stderr)
 if isinstance(e,subprocess.CalledProcessError):
  import re
  error=(e.stderr or b'').decode(errors='replace')
  # Schema diagnostics only; never print statements or data values.
  print('diagnostic_labels',re.findall(r'(?:constraint|relation|column) "([A-Za-z0-9_]+)"',error),file=sys.stderr)
 sys.exit(1)
