"""Shared, append-only review of public note relevance."""
import datetime,json,re
import app
from urllib.parse import quote

DECISIONS=('通过：西安本地服务','拒绝：行业无关','拒绝：外地','分流：行业重大事件','待定：证据不足')
def initialize(db):
    db.execute('CREATE TABLE IF NOT EXISTS note_review_votes(id INTEGER PRIMARY KEY,note_id TEXT NOT NULL,reviewer TEXT NOT NULL,decision TEXT NOT NULL,evidence TEXT NOT NULL,at TEXT NOT NULL)')
def save(db,data):
    initialize(db)
    if data.get('csrf')!=app.CSRF:raise ValueError('页面已过期，请刷新')
    reviewer=app.clean(data.get('reviewer'),40);key=data.get('note_id','')
    if not reviewer or data.get('decision') not in DECISIONS or not db.execute('SELECT 1 FROM notes WHERE note_id=?',(key,)).fetchone():raise ValueError('请填写有效复核结论')
    with db:db.execute('INSERT INTO note_review_votes(note_id,reviewer,decision,evidence,at) VALUES(?,?,?,?,?)',(key,reviewer,data['decision'],app.redact_comment(data.get('evidence','')),app.now()))
def page(db,date=None,message=''):
    initialize(db);date=date or datetime.datetime.now(app.TZ).strftime('%Y-%m-%d')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date):raise ValueError('日期无效')
    rows=db.execute("SELECT * FROM notes WHERE substr(first_seen,1,10)=? OR substr(last_seen,1,10)=? ORDER BY last_seen DESC",(date,date)).fetchall()
    e=app.esc;cards=[]
    for r in rows:
        n=json.loads(r['payload']);votes=db.execute('SELECT * FROM note_review_votes WHERE note_id=? ORDER BY id DESC',(r['note_id'],)).fetchall()
        options=''.join('<option>'+e(x)+'</option>' for x in DECISIONS)
        history=''.join(f"<p>{e(v['reviewer'])} · {e(v['decision'])}<br>{e(v['evidence'])} · {e(v['at'])}</p>" for v in votes)
        cards.append(f"""<article class='card'><h3>{e(n.get('title'))}</h3><p>{e(n.get('institution'))} · 笔记发布时间：{e(n.get('published_date') or '未知')}</p>
        <p>{e(n.get('summary'))}</p><p><a target='_blank' rel='noreferrer' href='{e(n.get('url'))}'>打开原帖核验正文</a> · <a target='_blank' rel='noreferrer' href='{e("https://www.xiaohongshu.com/search_result?keyword="+quote(str(n.get("title",""))))}'>按标题搜索原帖</a></p>
        <form method='post' action='/notes/save'><input type='hidden' name='csrf' value='{e(app.CSRF)}'><input type='hidden' name='note_id' value='{e(r['note_id'])}'><input type='hidden' name='date' value='{date}'>
        <label>复核人称呼</label><input name='reviewer' maxlength='40' required><label>笔记结论</label><select name='decision' required><option value=''>请选择</option>{options}</select>
        <label>行业、服务地点与类型证据</label><textarea name='evidence' maxlength='800'></textarea><button>保存笔记核验</button></form>
        <details><summary>已保存复核（{len(votes)}）</summary>{history}</details></article>""")
    return app.page('伴月轩笔记核验',app.header('每日笔记核验')+f"<section><h2>{date} · {len(rows)}篇发现或更新笔记</h2><p>先核验行业与西安服务证据；搜索词和陕西IP不等于本地证明。新闻单列观察。请用已登录小红书的 Chrome 打开；原帖不可访问时可按标题搜索，核对正文，仍找不到请标记待定。</p><p>{e(message)}</p><form action='/notes'><input type='date' name='date' value='{date}'><button>切换日期</button></form></section>"+(''.join(cards) or '<section>当天没有发现或更新笔记。</section>'))
