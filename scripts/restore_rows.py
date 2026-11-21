#!/usr/bin/env python3
"""Load a decrypted export into a NEW EMPTY test database, never production."""
import argparse,json,pathlib,re,subprocess
p=argparse.ArgumentParser();p.add_argument('rows');p.add_argument('--database',required=True);p.add_argument('--container',default='xiaoyue-postgres');a=p.parse_args()
if not re.fullmatch(r'byx_restore_[a-z0-9_]+',a.database):raise SystemExit('Use a new byx_restore_* database only')
rows=[json.loads(l) for l in pathlib.Path(a.rows).read_text().splitlines() if l.strip()]
allowed={'xiaoyue.messages','xiaoyue.attachments'}|{'xiaoyue_curated.'+n for n in ['people','accounts','categories','case_bundles','subjects','questions','answers','answer_links','evidence','question_categories','versions','source_documents','citations','media_variants','version_media','reviews','usage_permissions','dataset_items','case_relations','intake_keys','intake_runs']}
commands=['BEGIN;']
for r in rows:
 table=r['table']
 if table not in allowed:raise ValueError('Unexpected table')
 payload=json.dumps(r['row'],ensure_ascii=False).replace("'","''")
 commands.append(f"INSERT INTO {table} OVERRIDING SYSTEM VALUE SELECT * FROM json_populate_record(NULL::{table},'{payload}'::json);")
commands.append("DO $$ DECLARE r record; s text; BEGIN FOR r IN SELECT table_schema,table_name,column_name FROM information_schema.columns WHERE table_schema IN ('xiaoyue','xiaoyue_curated') LOOP s:=pg_get_serial_sequence(format('%I.%I',r.table_schema,r.table_name),r.column_name); IF s IS NOT NULL THEN EXECUTE format('SELECT setval(%L,COALESCE((SELECT max(%I) FROM %I.%I),1),EXISTS(SELECT 1 FROM %I.%I))',s,r.column_name,r.table_schema,r.table_name,r.table_schema,r.table_name); END IF; END LOOP; END $$;")
commands.append('COMMIT;')
subprocess.run(['docker','exec','-i',a.container,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','xiaoyue','-d',a.database],input='\n'.join(commands).encode(),check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print('Restored',len(rows),'records into isolated database',a.database)
