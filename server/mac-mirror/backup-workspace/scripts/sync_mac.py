#!/usr/bin/env python3
"""Launchd wakes every five minutes; IANA timezone, not Mac clock offset."""
import datetime as dt, fcntl, hashlib,json,os,pathlib,subprocess,sys,tarfile,tempfile
from zoneinfo import ZoneInfo
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from backup import collect,scan
ROOT=pathlib.Path(__file__).resolve().parents[1]
STATE=ROOT/'.local-state';STATE.mkdir(mode=0o700,exist_ok=True)
lock=open(STATE/'sync.lock','w');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
now=dt.datetime.now(ZoneInfo('Asia/Shanghai'));slot=now.strftime('%Y-%m-%d')+'-'+str((now.hour+3)//6%4)
last=STATE/'last-success.json'
old=json.loads(last.read_text()) if last.exists() else {}
# On wake, catch up if six hours old. Near scheduled slots, sync just before server backup.
due=now.hour in [2,8,14,20] and now.minute>=40
stale=not old or dt.datetime.now(dt.timezone.utc).timestamp()-old.get('timestamp',0)>21600
if '--now' not in sys.argv and not stale and not (due and old.get('slot')!=slot):sys.exit(0)
with tempfile.TemporaryDirectory(prefix='byx-mac-') as tmp:
 stage=pathlib.Path(tmp)/'mirror';stage.mkdir()
 inventory={}
 for label,source in [('backup-workspace',ROOT)]:
  inventory[label]=collect(source,stage/label)
 if any(v.get('blocked') for v in inventory.values()):raise SystemExit('Secret scan blocked Mac sync')
 (stage/'MAC-SYNC.json').write_text(json.dumps({'utc':dt.datetime.now(dt.timezone.utc).isoformat(),'beijing':now.isoformat(),'inventory':inventory},ensure_ascii=False))
 archive=pathlib.Path(tmp)/'mirror.tar.gz'
 with tarfile.open(archive,'w:gz') as tar:tar.add(stage,arcname='mac-mirror')
 key='/Users/alston/.ssh/banyuexuan_backup.pem';host='ubuntu@122.51.35.6'
 subprocess.run(['scp','-q','-o','BatchMode=yes','-i',key,str(archive),host+':/tmp/banyuexuan-mac-mirror.tar.gz'],check=True)
 # Extract into staging, then atomically exchange directory names; never mix generations.
 command='set -e; cd /opt/banyuexuan-backup; mkdir -p mac-staging; tar -xzf /tmp/banyuexuan-mac-mirror.tar.gz -C mac-staging; rm -rf mac-previous; mv mac-mirror mac-previous; mv mac-staging/mac-mirror mac-mirror; rmdir mac-staging'
 subprocess.run(['ssh','-o','BatchMode=yes','-i',key,host,command],check=True)
 last.write_text(json.dumps({'timestamp':dt.datetime.now(dt.timezone.utc).timestamp(),'slot':slot,'beijing':now.isoformat()}))
print('Mac project mirror synced')
