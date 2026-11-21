#!/usr/bin/env python3
"""Project-scoped backup. Raw data is encrypted before leaving the server."""
import base64, datetime as dt, fcntl, hashlib, http.client, json, os, pathlib, re, shutil, subprocess, sys, tarfile, tempfile, urllib.request, urllib.error
from zoneinfo import ZoneInfo
ROOT=pathlib.Path(os.environ.get('BYX_BACKUP_ROOT','/opt/banyuexuan-backup'))
ROOM='wrPPybcQAAh0UjrU0aSK-BdQpYi9kdFg'
REPO='Alston3825/banyuexuan-intelligent-hub'
TOKEN=pathlib.Path('/home/ubuntu/.config/banyuexuan-backup/github-token')
SKIP={'.git','node_modules','__pycache__','config','secrets','snapshots','outbox','state','.pending','data','backups','logs','uploads','media','.venv','venv','.local-state'}
EXT={'.py','.js','.ts','.tsx','.jsx','.sql','.html','.css','.md','.txt','.yml','.yaml','.sh','.json','.map','.toml','.pub','.plist','.service','.timer'}
def run(args,**kw):
    kw.setdefault('timeout',180)
    return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kw).stdout
def secret_file(p):
    n=p.name.lower()
    return n.startswith('.env') or any(x in n for x in ['secret','credential','token','private_key']) or p.suffix.lower() in {'.pem','.key','.p12','.pfx','.env'} or (p.suffix.lower()=='.json' and n not in {'package.json','package-lock.json','tsconfig.json','tsconfig.build.json'})
def scan(data):
    data=re.sub(rb'(?m)^\s*-\s+\./config/[A-Za-z0-9_./-]+:/run/secrets/[A-Za-z0-9_./-]+:ro\s*$',b'',data)
    patterns=[rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',rb'gh[pousr]_[A-Za-z0-9]{20,}',rb'github_pat_[A-Za-z0-9_]{20,}',rb'AKIA[0-9A-Z]{16}',rb'(?i)(?:password|secret|api_key|access_token)\s*[:=]\s*[\x22\x27]?(?!\$|os\.|process\.|pathlib|None|null|false|true)[A-Za-z0-9_+/=-]{16,}']
    return any(re.search(p,data) for p in patterns)
def collect(source,dest):
    result={'included':0,'excluded':0,'blocked':[]}
    if not source.exists():return {'missing':True,**result}
    for p in sorted(source.rglob('*')):
        rel=p.relative_to(source)
        if any(x in SKIP for x in rel.parts) or not p.is_file() or p.is_symlink():continue
        if secret_file(p) or (p.suffix.lower() not in EXT and p.name not in {'Dockerfile','Caddyfile','.gitignore'}):result['excluded']+=1;continue
        data=p.read_bytes()
        if scan(data): result['blocked'].append(str(rel));continue
        out=dest/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data);result['included']+=1
    return result
def api(method,path,body=None):
    headers={'Authorization':'Bearer '+TOKEN.read_text().strip(),'Accept':'application/vnd.github+json','User-Agent':'banyuexuan-backup'}
    data=None if body is None else json.dumps(body).encode()
    if data is not None:headers['Content-Type']='application/json'
    req=urllib.request.Request('https://api.github.com'+path,data=data,headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=60) as r:return json.load(r)
    except urllib.error.HTTPError as e:raise RuntimeError('GitHub API HTTP '+str(e.code)) from None
def sql(args,input=None):return run(['docker','exec','-i','xiaoyue-postgres','psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','xiaoyue','-d','xiaoyue']+args,input=input)
def snapshot(stage):
    db=stage/'database';db.mkdir()
    # Data is one repeatable-read snapshot, restricted to the single authorized group.
    data=sql([],input=(ROOT/'repo/scripts/export_group.sql').read_bytes());(db/'rows.jsonl').write_bytes(data)
    records=[json.loads(line) for line in data.splitlines() if line.strip()]
    for section in ['pre-data','post-data']:
        (db/(section+'.sql')).write_bytes(run(['docker','exec','xiaoyue-postgres','pg_dump','-U','xiaoyue','-d','xiaoyue','--schema-only','--no-owner','--no-acl','--section='+section,'-n','xiaoyue','-n','xiaoyue_curated']))
    counts={};missing=[];media=stage/'media';media.mkdir()
    for record in records:
        counts[record['table']]=counts.get(record['table'],0)+1
        row=record['row'];key=None
        if record['table'] in ['xiaoyue.attachments','xiaoyue_curated.media_variants']:key=row['storage_key']
        if key:
            rel=pathlib.PurePosixPath(key)
            if rel.is_absolute() or '..' in rel.parts:raise ValueError('Unsafe media path')
            src=pathlib.Path('/opt/xiaoyue/data/archive-media')/rel
            if not src.is_file():missing.append(key);continue
            dst=media/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
            md5=row.get('metadata',{}).get('md5')
            if md5 and hashlib.md5(dst.read_bytes()).hexdigest()!=md5:raise ValueError('Stored media checksum mismatch')
    pending=pathlib.Path('/opt/xiaoyue/data/archive-media/.pending')
    for p in pending.glob('*.json'):
        task=json.loads(p.read_text())
        if task.get('room_id')==ROOM:
            dst=stage/'pending-media'/p.name;dst.parent.mkdir(exist_ok=True);shutil.copy2(p,dst)
    if missing:raise ValueError('Referenced media missing; snapshot not complete')
    return counts
def upload_binary(tag,path):
    # Bounded chunks avoid GitHub per-asset limits and memory-sized uploads.
    conn=http.client.HTTPSConnection('uploads.github.com',timeout=300)
    headers={'Authorization':'Bearer '+TOKEN.read_text().strip(),'User-Agent':'banyuexuan-backup','Content-Type':'application/octet-stream','Content-Length':str(path.stat().st_size)}
    conn.putrequest('POST',tag);[conn.putheader(k,v) for k,v in headers.items()];conn.endheaders()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):conn.send(chunk)
    response=conn.getresponse();payload=response.read();conn.close()
    if response.status not in [200,201]:raise RuntimeError('Release upload HTTP '+str(response.status))
    return json.loads(payload)
def publish_code(manifest):
    root=ROOT/'repo';head=None;base=None
    try:
        head=api('GET','/repos/'+REPO+'/git/ref/heads/main')['object']['sha']
        base=api('GET','/repos/'+REPO+'/git/commits/'+head)['tree']['sha']
    except RuntimeError as e:
        if str(e)!='GitHub API HTTP 404' and str(e)!='GitHub API HTTP 409':raise
    remote={}
    if base:
        result=api('GET','/repos/'+REPO+'/git/trees/'+base+'?recursive=1')
        if result.get('truncated'):raise ValueError('Remote tree truncated')
        remote={e['path']:e['sha'] for e in result['tree'] if e['type']=='blob'}
    state=ROOT/'state/code-api.json';previous=json.loads(state.read_text()).get('files',{}) if state.exists() else {}
    tree=[];files={}
    for raw in run(['git','ls-files','-z'],cwd=root).split(b'\0'):
        if not raw:continue
        name=raw.decode();path=root/name;data=path.read_bytes();sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();files[name]=sha
        if remote.get(name)==sha:continue
        if name in previous and remote.get(name) not in [previous[name],sha,None]:raise ValueError('Remote development conflicts; merge required')
        tree.append({'path':name,'mode':'100755' if os.access(path,os.X_OK) else '100644','type':'blob','content':data.decode('utf-8')})
    if tree:
        body={'tree':tree}
        if base:body['base_tree']=base
        newtree=api('POST','/repos/'+REPO+'/git/trees',body)['sha']
        commit=api('POST','/repos/'+REPO+'/git/commits',{'message':'Backup '+manifest['id'],'tree':newtree,'parents':[head] if head else []})['sha']
        if head:api('PATCH','/repos/'+REPO+'/git/refs/heads/main',{'sha':commit,'force':False})
        else:api('POST','/repos/'+REPO+'/git/refs',{'ref':'refs/heads/main','sha':commit})
        head=commit
    actual=api('GET','/repos/'+REPO+'/git/ref/heads/main')['object']['sha']
    if actual!=head:raise ValueError('Remote head changed during verification')
    state.write_text(json.dumps({'commit':head,'files':files}));return head
def publish(folder,manifest):
    repo=api('GET','/repos/'+REPO)
    if not repo.get('private'):raise ValueError('Refuse non-private repository')
    for path in (ROOT/'repo').rglob('*'):
        if '.git' in path.parts or '__pycache__' in path.parts or not path.is_file():continue
        if path.suffix.lower() in {'.pem','.key','.dump','.enc'} or path.name.startswith('.env') or scan(path.read_bytes()):
            raise ValueError('Repository secret scan blocked publication')
    run(['git','add','--all'],cwd=ROOT/'repo')
    if run(['git','status','--porcelain'],cwd=ROOT/'repo').strip():
        run(['git','-c','user.name=Banyuexuan Backup','-c','user.email=backup@users.noreply.github.com','commit','-m','Backup '+manifest['id']],cwd=ROOT/'repo')
    # API access works independently of the server's blocked Git smart-HTTP route.
    publish_code(manifest)
    tag='backup-'+manifest['id']
    existing=api('GET','/repos/'+REPO+'/releases?per_page=100')
    release=next((r for r in existing if r['tag_name']==tag),None)
    if release is None:release=api('POST','/repos/'+REPO+'/releases',{'tag_name':tag,'name':'伴月轩智能中枢 '+manifest['beijing'],'body':'Encrypted group-scoped recovery snapshot. Check manifest and HANDOFF.md.','draft':True})
    present={a['name']:a for a in api('GET','/repos/'+REPO+'/releases/'+str(release['id'])+'/assets?per_page=100')}
    for path in sorted(folder.iterdir()):
        if path.name in present:
            if present[path.name]['size']!=path.stat().st_size:raise ValueError('Existing release asset mismatch')
            continue
        upload_binary('/repos/'+REPO+'/releases/'+str(release['id'])+'/assets?name='+path.name,path)
    assets=api('GET','/repos/'+REPO+'/releases/'+str(release['id'])+'/assets?per_page=100')
    if {p.name:p.stat().st_size for p in folder.iterdir()}!={a['name']:a['size'] for a in assets}:raise ValueError('Remote asset listing mismatch')
    for asset in assets:
        local=folder/asset['name'];expected='sha256:'+hashlib.sha256(local.read_bytes()).hexdigest()
        if asset.get('digest') and asset['digest']!=expected:raise ValueError('Remote asset digest mismatch')
    api('PATCH','/repos/'+REPO+'/releases/'+str(release['id']),{'draft':False})
    return 'https://github.com/'+REPO+'/releases/tag/'+tag
def main():
    from crypto import encrypt
    os.umask(0o077);(ROOT/'state').mkdir(parents=True,exist_ok=True);(ROOT/'outbox').mkdir(exist_ok=True)
    lock=open(ROOT/'state/run.lock','w');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    now=dt.datetime.now(dt.timezone.utc);bj=now.astimezone(ZoneInfo('Asia/Shanghai'));ident=now.strftime('%Y%m%dT%H%M%SZ')
    if shutil.disk_usage(ROOT).free<5*1024**3:raise RuntimeError('Less than 5 GiB free; refuse backup')
    inv={};sources=ROOT/'repo/server';shutil.rmtree(sources,ignore_errors=True);sources.mkdir(parents=True)
    for label,path in [('xiaoyue',pathlib.Path('/opt/xiaoyue')),('review-app',pathlib.Path('/opt/xhs-review')),('mac-mirror',ROOT/'mac-mirror')]:
        inv[label]=collect(path,sources/label)
    (ROOT/'state/inventory.json').write_text(json.dumps(inv,ensure_ascii=False,indent=2))
    if any(v.get('blocked') for v in inv.values()):raise RuntimeError('Secret-like content blocked; inspect local state inventory')
    intake=pathlib.Path('/home/ubuntu/xiaoyue-intake.sql')
    if intake.exists():
        payload=intake.read_bytes()
        if scan(payload):raise RuntimeError('Intake schema failed secret scan')
        target=sources/'database/xiaoyue-intake.sql';target.parent.mkdir(exist_ok=True);target.write_bytes(payload)
    manifest={'id':ident,'beijing':bj.isoformat(),'utc':now.isoformat(),'los_angeles':now.astimezone(ZoneInfo('America/Los_Angeles')).isoformat(),'room_id':ROOM,'scope':'one_group_only','inventory':inv,'private_keys_included':False}
    with tempfile.TemporaryDirectory(prefix='byx-',dir=ROOT/'state') as temp:
        stage=pathlib.Path(temp);manifest['row_counts']=snapshot(stage)
        pending_root=pathlib.Path('/opt/xiaoyue/data/archive-media/.pending')
        manifest['pending_media_count']=sum(1 for p in pending_root.glob('*.json') if json.loads(p.read_text()).get('room_id')==ROOM)
        mac_stamp=ROOT/'mac-mirror/MAC-SYNC.json'
        manifest['mac_sync']=json.loads(mac_stamp.read_text()) if mac_stamp.exists() else {'missing':True}
        changes=run(['git','status','--short'],cwd=ROOT/'repo').decode()
        manifest['changed_paths']=changes.splitlines()
        auto='\n<!-- AUTO-STATUS:START -->\n## 自动更新的接手检查点\n\n采样北京时间：'+manifest['beijing']+'。\n\n当前正式群原始消息 '+str(manifest['row_counts'].get('xiaoyue.messages',0))+' 条；案例包 '+str(manifest['row_counts'].get('xiaoyue_curated.case_bundles',0))+'；待重试附件 '+str(manifest['pending_media_count'])+'。资料清单、Mac同步时间及文件变化见 progress/LATEST.json。\n\n本段随每次备份自动更新；人工待办仍以本文上方为准。快照上传结果必须核对GitHub Release和服务器state/last-run.json，不能以此采样时间替代成功。\n<!-- AUTO-STATUS:END -->\n'
        handoff=ROOT/'repo/HANDOFF.md';text=handoff.read_text();text=re.sub(r'\n<!-- AUTO-STATUS:START -->.*?<!-- AUTO-STATUS:END -->\n','\n',text,flags=re.S);handoff.write_text(text.rstrip()+'\n'+auto)
        (ROOT/('repo/progress/'+bj.strftime('%Y-%m-%d')+'.md')).open('a').write('\n- '+bj.isoformat()+'：备份采样；正式群消息 '+str(manifest['row_counts'].get('xiaoyue.messages',0))+' 条；待重试附件 '+str(manifest['pending_media_count'])+'。文件变化详见同次LATEST清单，上传结果另核对。\n')
        binary=pathlib.Path('/opt/xiaoyue/app/archive-worker/libWeWorkFinanceSdk_C.so')
        if binary.exists():
            (stage/'binary').mkdir();shutil.copy2(binary,stage/'binary'/binary.name)
            manifest['finance_sdk_sha256']=hashlib.sha256(binary.read_bytes()).hexdigest()
        notes=ROOT/'private-notes'
        if notes.exists():shutil.copytree(notes,stage/'private-notes')
        (ROOT/'repo/progress/LATEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
        (ROOT/'repo/HANDOFF-AUTO.md').write_text('# 自动交接状态\n\n项目：伴月轩智能中枢。\n\n本次采样北京时间：'+manifest['beijing']+'\n\n数据计数与代码清单见 progress/LATEST.json；决策、待办和未验收项见 HANDOFF.md。GitHub传输结果以服务器state/last-run.json及远端提交/Release为准。\n')
        shutil.copytree(ROOT/'repo',stage/'project',ignore=shutil.ignore_patterns('.git','*.log','__pycache__'))
        files=[]
        for item in sorted(stage.rglob('*')):
            if item.is_file():files.append({'path':str(item.relative_to(stage)),'bytes':item.stat().st_size,'sha256':hashlib.sha256(item.read_bytes()).hexdigest()})
        (stage/'FILE-MANIFEST.json').write_text(json.dumps(files,ensure_ascii=False,indent=2))
        # Sensitive deployment config is intentionally excluded; restore secrets from the owner's vault.
        archive=stage/'snapshot.tar.gz'
        with tarfile.open(archive,'w:gz') as tar:
            for item in sorted(stage.iterdir()):
                if item!=archive:tar.add(item,arcname=item.name)
        folder=ROOT/'outbox'/ident;folder.mkdir()
        encrypted=stage/'snapshot.enc';encrypt(archive,encrypted,ROOT/'repo/operations/encryption-public.pub')
        parts=[]
        with encrypted.open('rb') as src:
            number=0
            while True:
                chunk=src.read(128*1024**2)
                if not chunk:break
                name='snapshot.enc.part'+str(number).zfill(3);(folder/name).write_bytes(chunk)
                parts.append({'name':name,'bytes':len(chunk),'sha256':hashlib.sha256(chunk).hexdigest()});number+=1
        manifest['parts']=parts;manifest['encrypted_sha256']=hashlib.sha256(encrypted.read_bytes()).hexdigest()
        (folder/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    (ROOT/'repo/progress/LATEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    result={'snapshot':ident,'local_snapshot_complete':True,'github_uploaded':False}
    if TOKEN.exists():
        # Replay oldest unsent completed snapshots; no silent dropping after outages.
        for pending in sorted((ROOT/'outbox').iterdir()):
            if not pending.is_dir() or (ROOT/'state'/('sent-'+pending.name)).exists():continue
            m=json.loads((pending/'manifest.json').read_text());url=publish(pending,m)
            (ROOT/'state'/('sent-'+pending.name)).write_text(url+'\n')
        result['github_uploaded']=True
    else:result['blocked_reason']='GitHub authentication missing'
    (ROOT/'state/last-run.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result))
    if not result['github_uploaded']:sys.exit(3)
if __name__=='__main__':
    try:main()
    except Exception as e:
        # No exception payloads/HTTP response bodies containing credentials or private records.
        if (ROOT/'state').exists():
            (ROOT/'state/last-error.txt').write_text(type(e).__name__+'\n')
            (ROOT/'state/last-run.json').write_text(json.dumps({'checked_at':dt.datetime.now(dt.timezone.utc).isoformat(),'github_uploaded':False,'error_class':type(e).__name__,'message':str(e) if isinstance(e,(RuntimeError,ValueError)) else 'Check server diagnostic securely'}))
        print('Backup failed: '+type(e).__name__,file=sys.stderr);sys.exit(1)
