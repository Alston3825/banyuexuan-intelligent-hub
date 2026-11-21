"""Daily content review, with append-only reviewer decisions."""
import datetime
import json
import re
from urllib.parse import quote

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

def page(db,date=None,message='',note_id=None,batch=None):
    import app
    date=date or datetime.datetime.now(app.TZ).strftime('%Y-%m-%d')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date): raise ValueError('日期无效')
    initialize(db)
    assignment_path=app.ROOT/'data/note-review-assignments.json'
    assignments=json.loads(assignment_path.read_text()).get(date,{}) if assignment_path.exists() else {}
    batch_record=None
    if batch:
        registry=app.ROOT/'data/shared-review-batches.json'
        records=json.loads(registry.read_text()) if registry.exists() else {}
        if batch not in records:raise ValueError('批次不存在')
        batch_record=records[batch];date=batch_record['date'];assignments=batch_record['assignments']
    today=datetime.datetime.now(app.TZ).strftime('%Y-%m-%d')
    historical_notice=(f"<section class='notice warning'><h2>历史报告：{date}，不是今天的新采集</h2><p>今天是{today}。此链接固定保留旧批次，请勿把旧批次当作今天的成果。</p><a href='/review?date={today}'>查看今天的采集与复核入口</a></section>" if date!=today else '')
    assigned_name=assignments.get(note_id,'')
    if note_id and not re.fullmatch(r'[a-f0-9]{24}',note_id): raise ValueError('笔记编号无效')
    if note_id:
        rows=db.execute("SELECT c.*,n.payload FROM anonymous_comments c JOIN notes n ON c.note_id=n.note_id WHERE c.note_id=? ORDER BY c.id",(note_id,)).fetchall()
        grouped={}
        for row in rows: grouped.setdefault(row['text'],[]).append(row)
        rows=[next((r for r in group if db.execute('SELECT 1 FROM comment_reviews WHERE comment_id=?',(r['id'],)).fetchone()),group[0]) for group in grouped.values()]
    else:
        manifest=app.ROOT/'data/daily-note-batches.json'
        assigned=batch_record['notes'] if batch_record else (json.loads(manifest.read_text()).get(date,[]) if manifest.exists() else [])
        links=[]
        for key in assigned:
            record=db.execute('SELECT payload FROM notes WHERE note_id=?',(key,)).fetchone()
            if record:
                title=json.loads(record[0])['title']
                count=db.execute('SELECT count(DISTINCT text) FROM anonymous_comments WHERE note_id=?',(key,)).fetchone()[0]
                links.append(f"<article class='card'><h3>报告 {len(links)+1} · {app.esc(assignments.get(key,''))}：{app.esc(title)}</h3><p>{count}条去重后的已采集评论；同一笔记历次评论集中复核。</p><a href='/review?date={date}&amp;note_id={key}'>打开独立复核报告</a></article>")
        if links:
            return app.page('按笔记分工复核',app.header('按笔记分工复核')+historical_notice+f"<section><h2>{date} · {len(links)}/4 份笔记报告</h2><p>批次：{app.esc(batch or '当天最新分工')}</p><p><button onclick=\"navigator.clipboard.writeText(location.href).then(()=>this.textContent='链接已复制').catch(()=>this.textContent='请复制地址栏链接')\">复制分工页面链接</button></p><p>请按自己的姓名进入报告；已保存的复核记录保留。页面只包含已采集评论，不代表平台全部评论。</p></section>"+''.join(links))
        rows=db.execute("SELECT c.*,n.payload FROM anonymous_comments c JOIN notes n ON c.note_id=n.note_id WHERE substr(c.collected_at,1,10)=? ORDER BY c.id",(date,)).fetchall()
    e=app.esc
    def select(name,values):
        return f"<select name='{name}' required><option value=''>请选择</option>"+''.join(f'<option>{e(v)}</option>' for v in values)+'</select>'
    cards=[]
    for r in rows:
        n=json.loads(r['payload']);search_url='https://www.xiaohongshu.com/search_result?keyword='+quote(str(n.get('title','')))
        history=db.execute('SELECT * FROM comment_reviews WHERE comment_id=? ORDER BY id DESC',(r['id'],)).fetchall()
        label=n.get('title','公开笔记')[:22]+'｜“'+r['text'][:24]+'”'
        past=''.join(f"<p><b>{e(h['reviewer'])}</b> · {e(h['at'])}<br>{e(h['relevance'])} / {e(h['grade'])} / {e(h['action'])}<br>{e(h['reason'])}</p>" for h in history)
        restriction="<p class='notice warning'>原帖注明广告勿扰；可公开阅读，不建议营销回应。</p>" if '广告勿扰' in str(n.get('summary','')) else ''
        cards.append(f"""<article class='card review' data-done='{bool(history)}' id='comment-{r['id']}'>
        <h3>{e(label)}</h3>{restriction}<p class='muted'>公开时间：{e(r['time_label'] or '未知')} · 回复层级：未获数据源核验</p>
        <blockquote>{e(r['text'])}</blockquote><p><a target='_blank' rel='noreferrer' href='{e(n.get('url',''))}'>打开原帖</a> · <a target='_blank' rel='noreferrer' href='{e(search_url)}'>按标题搜索原帖</a>
        <button type='button' class='copy' data-text='{e(r['text'])}'>复制评论以定位</button></p>
        <details><summary>采集时的原帖正文</summary><p>{e(n.get('summary',''))}</p><p class='muted'>这是采集时保存的文本，不能证明原帖当前仍可访问。</p></details>
        <details><summary>查看系统分级与理由</summary><p>{e(r['content_grade'])}：{e(r['reason'])}</p></details>
        <form method='post' action='/review/save'><input type='hidden' name='csrf' value='{e(app.CSRF)}'>
        <input type='hidden' name='note_id' value='{e(note_id or chr(32))}'><input type='hidden' name='comment_id' value='{r['id']}'><input type='hidden' name='date' value='{date}'>
        <label>复核人称呼</label><input class='reviewer' name='reviewer' maxlength='40' required>
        <label>相关性</label>{select('relevance',RELEVANCE)}<label>人工分级</label>{select('grade',GRADES)}
        <label>回应建议</label>{select('action',ACTIONS)}<label>理由或纠正说明</label>
        <textarea name='reason' maxlength='800'></textarea><p><button>保存本次复核</button></p></form>
        <details><summary>已有复核记录（{len(history)}）</summary>{past or '<p>尚未复核</p>'}</details></article>""")
    done=sum(bool(db.execute('SELECT 1 FROM comment_reviews WHERE comment_id=?',(r['id'],)).fetchone()) for r in rows)
    batch_warning=("<p class='notice warning'>历史首批60条来自两篇无关旅游笔记及一篇外地重大事故新闻，仅用于错误复核，不作为有效获客成果。</p>" if date=='2026-10-09' else '')
    body=app.header('每日内容协作复核')+historical_notice+f"""<section><h2>{date} · {e(assigned_name)} · {e(json.loads(rows[0]['payload'])['title']) if note_id and rows else '评论复核'} · 共{len(rows)}条 · 已复核{done}条</h2>{batch_warning}
      <p>先确认行业与西安地域，再判断是否为当下服务咨询。重大事故新闻单列观察；经验分享、价格讨论不等于询价。</p>
      <p>请在已登录小红书的 Chrome 中打开原帖；微信内置浏览器或其他未登录浏览器可能打不开。若提示页面不见了，可按标题搜索并核对正文；仍找不到请标记无法判断，不要推断原帖已删除。复制评论后在原帖中搜索文字。昵称、头像请在平台原帖查看；当前链接进入笔记，不能保证跳至具体评论。</p>
      <form method='get' action='/review'><input type='date' name='date' value='{date}'><button>切换日期</button></form>
      <p><button type='button' id='share'>复制当前页面链接</button> <label><input type='checkbox' id='pending' style='width:auto'>只看未复核</label></p>
      <p role='status' id='notice'>{e(message)}</p></section>"""+(''.join(cards) or '<section>今天尚未产出可复核的新评论；未生成四篇新笔记报告。不会用历史数据补足名额。</section>')
    body+='''<script>
    const notice=document.querySelector('#notice');
    async function copy(text){try{await navigator.clipboard.writeText(text);notice.textContent='已复制';}catch{notice.textContent='无法自动复制，请手动选择文字或地址栏复制';}}
    document.querySelectorAll('.copy').forEach(b=>b.onclick=()=>copy(b.dataset.text));
    document.querySelector('#share').onclick=()=>copy(location.href);
    document.querySelector('#pending').onchange=e=>document.querySelectorAll('.review').forEach(c=>c.hidden=e.target.checked&&c.dataset.done==='True');
    document.querySelectorAll('.reviewer').forEach(i=>{i.value=localStorage.getItem('reviewer')||'';i.onchange=()=>{localStorage.setItem('reviewer',i.value);document.querySelectorAll('.reviewer').forEach(x=>x.value=i.value);};});
    </script>'''
    return app.page('伴月轩每日复核',body)
