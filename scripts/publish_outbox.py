#!/usr/bin/env python3
"""Replay completed encrypted snapshots without producing duplicate exports."""
import json,sys
from backup import ROOT,publish
import fcntl
lock=open(ROOT/'state/run.lock','w');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
try:
 for folder in sorted((ROOT/'outbox').iterdir()):
  marker=ROOT/'state'/('sent-'+folder.name)
  if not folder.is_dir() or marker.exists():continue
  manifest=json.loads((folder/'manifest.json').read_text());url=publish(folder,manifest);marker.write_text(url+'\n')
  result={'snapshot':folder.name,'local_snapshot_complete':True,'github_uploaded':True,'release':url}
  (ROOT/'state/last-run.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
except Exception as e:
 (ROOT/'state/last-run.json').write_text(json.dumps({'github_uploaded':False,'error_class':type(e).__name__,'message':str(e) if isinstance(e,(ValueError,RuntimeError)) else 'Network or process failure'}));print('Publish failed: '+type(e).__name__,file=sys.stderr);sys.exit(1)
