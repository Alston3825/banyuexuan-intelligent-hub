"""Daily content review, with append-only reviewer decisions."""
import datetime
import json
import re

RELEVANCE=("西安月子中心相关","行业相关但地域不明","外地月子中心","行业重大事件","无关","无法判断")
GRADES=("A明确服务咨询","B一般比较咨询","C经验或讨论","推广待复核","无关","无法判断")
ACTIONS=("建议人工公开回应","暂不回应","需看原帖")

def initialize(db):
    db.execute("""CREATE TABLE IF NOT EXISTS comment_reviews(id INTEGER PRIMARY KEY,
      comment_id INTEGER NOT NULL,reviewer TEXT NOT NULL,relevance TEXT NOT NULL,
      grade TEXT NOT NULL,action TEXT NOT NULL,reason TEXT NOT NULL,at TEXT NOT NULL)""")

def save(db,data):
    import app
    initialize(db)
    if data.get('csrf')!=app.CSRF: raise ValueError('页面已过期，请刷新后重试')
    reviewer=app.clean(data.get('reviewer'),40)
    if not reviewer: raise ValueError('请填写复核人称呼')
    try: key=int(data.get('comment_id',''))
    except ValueError: raise ValueError('评论编号无效')
    if not db.execute('SELECT id FROM anonymous_comments WHERE id=?',(key,)).fetchone(): raise ValueError('评论不存在')
    if data.get('relevance') not in RELEVANCE or data.get('grade') not in GRADES or data.get('action') not in ACTIONS:
        raise ValueError('请完成相关性、分级和回应建议')
    with db:
        db.execute('INSERT INTO comment_reviews(comment_id,reviewer,relevance,grade,action,reason,at) VALUES(?,?,?,?,?,?,?)',
          (key,reviewer,data['relevance'],data['grade'],data['action'],app.redact_comment(data.get('reason','')),app.now()))

def page(db,date=None,message=''):
    import app
    date=date or datetime.datetime.now(app.TZ).strftime('%Y-%m-%d')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date): raise ValueError('日期无效')
    initialize(db)
    rows=db.execute("""SELECT c.*,n.payload FROM anonymous_comments c JOIN notes n ON c.note_id=n.note_id
      WHERE substr(c.collected_at,1,10)=? ORDER BY c.id""",(date,)).fetchall()
    e=app.esc
    def select(name,values):
        return f"<select name='{name}' required><option value=''>请选择</option>"+''.join(f'<option>{e(v)}</option>' for v in values)+'</select>'
    cards=[]
    for r in rows:
        n=json.loads(r['payload']);history=db.execute('SELECT * FROM comment_reviews WHERE comment_id=? ORDER BY id DESC',(r['id'],)).fetchall()
        label=n.get('title','公开笔记')[:22]+'｜“'+r['text'][:24]+'”'
        past=''.join(f"<p><b>{e(h['reviewer'])}</b> · {e(h['at'])}<br>{e(h['relevance'])} / {e(h['grade'])} / {e(h['action'])}<br>{e(h['reason'])}</p>" for h in history)
        cards.append(f"""<article class='card review' data-done='{bool(history)}' id='comment-{r['id']}'>
        <h3>{e(label)}</h3><p class='muted'>公开时间：{e(r['time_label'] or '未知')} · 回复层级：未获数据源核验</p>
        <blockquote>{e(r['text'])}</blockquote><p><a target='_blank' rel='noreferrer' href='{e(n.get('url',''))}'>打开原帖</a>
        <button type='button' class='copy' data-text='{e(r['text'])}'>复制评论以定位</button></p>
        <details><summary>查看系统分级与理由</summary><p>{e(r['content_grade'])}：{e(r['reason'])}</p></details>
        <form method='post' action='/review/save'><input type='hidden' name='csrf' value='{e(app.CSRF)}'>
        <input type='hidden' name='comment_id' value='{r['id']}'><input type='hidden' name='date' value='{date}'>
        <label>复核人称呼</label><input class='reviewer' name='reviewer' maxlength='40' required>
        <label>相关性</label>{select('relevance',RELEVANCE)}<label>人工分级</label>{select('grade',GRADES)}
        <label>回应建议</label>{select('action',ACTIONS)}<label>理由或纠正说明</label>
        <textarea name='reason' maxlength='800'></textarea><p><button>保存本次复核</button></p></form>
        <details><summary>已有复核记录（{len(history)}）</summary>{past or '<p>尚未复核</p>'}</details></article>""")
    done=sum(bool(db.execute('SELECT 1 FROM comment_reviews WHERE comment_id=?',(r['id'],)).fetchone()) for r in rows)
    batch_warning=("<p class='notice warning'>本批60条来自两篇无关旅游笔记及一篇外地重大事故新闻，仅用于错误复核，不作为有效获客成果。</p>" if date=='2026-10-09' else '')
    body=app.header('每日内容协作复核')+f"""<section><h2>{date} · 共{len(rows)}条 · 已复核{done}条</h2>{batch_warning}
      <p>先确认行业与西安地域，再判断是否为当下服务咨询。重大事故新闻单列观察；经验分享、价格讨论不等于询价。</p>
      <p>复制评论后在原帖中搜索文字。昵称、头像请在平台原帖查看；当前链接进入笔记，不能保证跳至具体评论。</p>
      <form method='get' action='/review'><input type='date' name='date' value='{date}'><button>切换日期</button></form>
      <p><button type='button' id='share'>复制当前页面链接</button> <label><input type='checkbox' id='pending' style='width:auto'>只看未复核</label></p>
      <p role='status' id='notice'>{e(message)}</p></section>"""+(''.join(cards) or '<section>当天尚无回收评论。不会用历史数据冒充当日样本。</section>')
    body+='''<script>
    const notice=document.querySelector('#notice');
    async function copy(text){try{await navigator.clipboard.writeText(text);notice.textContent='已复制';}catch{notice.textContent='无法自动复制，请手动选择文字或地址栏复制';}}
    document.querySelectorAll('.copy').forEach(b=>b.onclick=()=>copy(b.dataset.text));
    document.querySelector('#share').onclick=()=>copy(location.href);
    document.querySelector('#pending').onchange=e=>document.querySelectorAll('.review').forEach(c=>c.hidden=e.target.checked&&c.dataset.done==='True');
    document.querySelectorAll('.reviewer').forEach(i=>{i.value=localStorage.getItem('reviewer')||'';i.onchange=()=>{localStorage.setItem('reviewer',i.value);document.querySelectorAll('.reviewer').forEach(x=>x.value=i.value);};});
    </script>'''
    return app.page('伴月轩每日复核',body)
