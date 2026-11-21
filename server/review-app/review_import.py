import json
from pathlib import Path
import app
import review_web
p=Path('/app/feed.pending.json');data=json.loads(p.read_text())
c=app.connect();review_web.initialize(c)
with c:
    for table in ('notes','anonymous_comments'):
        allowed={r[1] for r in c.execute('PRAGMA table_info('+table+')')}
        for row in data[table]:
            keys=[k for k in row if k in allowed]
            if table=='anonymous_comments':
                existing=c.execute('SELECT comment_key FROM anonymous_comments WHERE id=?',(row['id'],)).fetchone()
                if existing and existing[0]!=row['comment_key']:raise ValueError('Comment ID conflict; reviews preserved')
            update=[k for k in keys if k not in ('id','note_id','comment_key')]
            target='note_id' if table=='notes' else 'id'
            sql='INSERT INTO '+table+'('+','.join(keys)+') VALUES('+','.join('?' for _ in keys)+') ON CONFLICT('+target+') DO UPDATE SET '+','.join(k+'=excluded.'+k for k in update)
            c.execute(sql,[row[k] for k in keys])
print('public_feed_imported',len(data['notes']),len(data['anonymous_comments']))
c.close();p.unlink()
