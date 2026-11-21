"""伴月轩第一阶段：公开内容采集、匿名化研判与本地报告。"""
import argparse, datetime as dt, hashlib, html, json, re, secrets, sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
TZ = dt.timezone(dt.timedelta(hours=8))
STATUSES = ("待处理", "已查看", "已公开回复", "等待预约", "无效")
LEAD_WORDS = ("求推荐", "推荐", "怎么选", "选择", "选定", "决赛圈", "对比", "避雷", "价格", "预算", "咨询", "哪家", "怎么样", "探店")
CSRF = secrets.token_urlsafe(24)

def now(): return dt.datetime.now(TZ).isoformat(timespec="seconds")
def config(): return json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
def clean(value, limit): return " ".join(value.split())[:limit] if isinstance(value, str) else ""
def esc(value): return html.escape(str(value or ""), quote=True)

def connect(path=None):
    p = Path(path or ROOT / "data/market.sqlite3"); p.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(p); db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS notes(note_id TEXT PRIMARY KEY,payload TEXT NOT NULL,fingerprint TEXT NOT NULL,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL,changed_at TEXT NOT NULL,source TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS runs(id INTEGER PRIMARY KEY,at TEXT,source TEXT,status TEXT,received INTEGER,added INTEGER,updated INTEGER,unchanged INTEGER,coverage TEXT,error TEXT);
    CREATE TABLE IF NOT EXISTS collection_audits(id INTEGER PRIMARY KEY,at TEXT,query TEXT,institution TEXT,stats TEXT);
    CREATE TABLE IF NOT EXISTS relevance_reviews(note_id TEXT,institution TEXT,checked_at TEXT,status TEXT,evidence TEXT,PRIMARY KEY(note_id,institution));
    CREATE TABLE IF NOT EXISTS lead_queue(note_id TEXT PRIMARY KEY,score INTEGER NOT NULL,intent TEXT NOT NULL,reasons TEXT NOT NULL,recommended_store TEXT NOT NULL,reply_draft TEXT NOT NULL,status TEXT NOT NULL,owner TEXT,handled_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS appointments(id INTEGER PRIMARY KEY,name TEXT NOT NULL,phone TEXT NOT NULL,store TEXT NOT NULL,expected_month TEXT,budget TEXT,interests TEXT NOT NULL,source_note_id TEXT,consent_at TEXT NOT NULL,owner TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(phone,created_at));
    CREATE TABLE IF NOT EXISTS anonymous_comments(id INTEGER PRIMARY KEY,note_id TEXT NOT NULL,comment_key TEXT NOT NULL UNIQUE,text TEXT NOT NULL,likes INTEGER,time_label TEXT NOT NULL,content_grade TEXT NOT NULL,reason TEXT NOT NULL,collected_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS redfox_comment_tasks(note_id TEXT PRIMARY KEY,task_id TEXT NOT NULL UNIQUE,requested_count INTEGER NOT NULL,status TEXT NOT NULL,submitted_at TEXT NOT NULL,last_checked_at TEXT,error TEXT);
    CREATE TABLE IF NOT EXISTS task_events(id INTEGER PRIMARY KEY,task_id TEXT NOT NULL,at TEXT NOT NULL,event TEXT NOT NULL,status TEXT NOT NULL,detail TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS collection_runs(id INTEGER PRIMARY KEY,started_at TEXT NOT NULL,finished_at TEXT,source TEXT NOT NULL,status TEXT NOT NULL,details TEXT NOT NULL);
    """)
    # Existing local databases are upgraded in place. These fields contain task
    # health only; no platform-account or contact data is stored.
    columns={row[1] for row in db.execute("PRAGMA table_info(redfox_comment_tasks)")}
    for name, definition in (("attempt_count","INTEGER NOT NULL DEFAULT 0"),("completed_at","TEXT"),("last_result_count","INTEGER NOT NULL DEFAULT 0"),("next_poll_at","TEXT")):
        if name not in columns:
            db.execute(f"ALTER TABLE redfox_comment_tasks ADD COLUMN {name} {definition}")
    return db

def record_task_event(db, task_id, event, status, detail=""):
    db.execute("INSERT INTO task_events(task_id,at,event,status,detail) VALUES(?,?,?,?,?)",(task_id,now(),clean(event,80),clean(status,30),clean(detail,500)))

def health_summary(db):
    counts={row["status"]:row["n"] for row in db.execute("SELECT status,count(*) n FROM redfox_comment_tasks GROUP BY status")}
    latest=db.execute("SELECT started_at,finished_at,source,status,details FROM collection_runs ORDER BY id DESC LIMIT 1").fetchone()
    latest_note=db.execute("SELECT last_seen FROM notes ORDER BY last_seen DESC LIMIT 1").fetchone()
    return {"tasks":counts,"latest_run":dict(latest) if latest else None,"latest_note_at":latest_note["last_seen"] if latest_note else None}

def score_note(note):
    title = clean(note.get("title"), 500); hits = [w for w in LEAD_WORDS if w in title]
    if note.get("institution") != "市场需求" or not hits: return None
    score = min(100, 35 + min(30, len(hits) * 12) + (15 if "西安" in title else 0) + (15 if any(w in title for w in ("价格", "预算", "档期", "求推荐", "决赛圈")) else 0))
    store = "高新店" if any(w in title for w in ("高新", "团结南路")) else "枣园店" if any(w in title for w in ("枣园", "莲湖", "西二环", "地铁")) else "待人工判断"
    reasons = "标题命中：" + "、".join(hits or ["月子中心"]) + ("；含西安地域词" if "西安" in title else "")
    store_line = {"高新店":"高新店在高新医院隔壁，楼层高、采光好，专职护理主任查房。", "枣园店":"枣园店在枣园地铁站口，交通便利，价格更具性价比，专职护理主任查房。"}.get(store, "可根据位置、预算和预产期协助比较高新店、枣园店。")
    draft = f"公开回复建议：可以先按位置、预算和护理模式比较。{store_line}可预约到店领取礼品，免费试吃；抖音团购券支持99元抵2000元。如需可通过预约页自愿提交信息，由顾问在3小时内联系。"
    return {"score":score,"intent":" / ".join(hits[:3]) or "月子中心需求","reasons":reasons,"recommended_store":store,"reply_draft":draft}

def redact_comment(text):
    text=clean(text,800)
    text=re.sub(r"1\d{10}", "[手机号已隐藏]", text)
    text=re.sub(r"(?i)(微信|vx|v信|v\s*x)\s*[:：]?\s*[a-z0-9_-]{3,}", "[联系方式已隐藏]", text)
    return text

def classify_comment(text, official_context=False):
    text=redact_comment(text)
    if any(word in text for word in ("找我", "私信我", "加我", "代理", "团购", "优惠券")):
        return "推广样式待人工复核", "文本含引流或促销样式；不判断发布者身份。"
    if any(word in text for word in ("询价", "价格", "多少钱", "有房", "档期", "怎么联系", "地址", "预约", "试吃", "参观", "预产期")):
        source_note = "；该笔记为人工确认的机构官方公开内容" if official_context else ""
        return "A类内容线索", "文本明确询问价格、档期、地址、联系或到店服务" + source_note + "。"
    if any(word in text for word in ("推荐", "怎么样", "哪家", "了解", "咨询", "附近")):
        return "B类内容线索", "文本表达比较、了解或一般咨询需求。"
    return "C类待观察", "文本未出现明确决策或咨询信息。"

def ingest_comments(db, note_id, rows):
    collected=0; stamp=now(); official_context=note_id in set(config().get("official_organization_note_ids", []))
    with db:
        for index,row in enumerate(rows):
            text=redact_comment(row.get("text"))
            if not text: continue
            grade,reason=classify_comment(text, official_context)
            key=hashlib.sha256((note_id+"|"+str(row.get("rank",index))+"|"+str(row.get("time",""))+"|"+text).encode()).hexdigest()
            likes=row.get("likes",0)
            try: likes=int(likes)
            except (TypeError,ValueError): likes=0
            inserted=db.execute("INSERT OR IGNORE INTO anonymous_comments(note_id,comment_key,text,likes,time_label,content_grade,reason,collected_at) VALUES(?,?,?,?,?,?,?,?)",(note_id,key,text,likes,clean(row.get("time"),40),grade,reason,stamp))
            collected += inserted.rowcount
    return collected

def refresh_lead_queue(db):
    stamp=now(); changed=0
    db.execute("DELETE FROM lead_queue WHERE note_id IN (SELECT note_id FROM notes WHERE json_extract(payload,'$.institution') != '市场需求')")
    for row in db.execute("SELECT note_id,payload FROM notes"):
        result=score_note(json.loads(row["payload"]))
        if not result: continue
        existing=db.execute("SELECT note_id FROM lead_queue WHERE note_id=?",(row["note_id"],)).fetchone()
        if existing:
            db.execute("UPDATE lead_queue SET score=?,intent=?,reasons=?,recommended_store=?,reply_draft=?,updated_at=? WHERE note_id=?",(result["score"],result["intent"],result["reasons"],result["recommended_store"],result["reply_draft"],stamp,row["note_id"]))
        else:
            db.execute("INSERT INTO lead_queue VALUES(?,?,?,?,?,?,?,?,?,?,?)",(row["note_id"],result["score"],result["intent"],result["reasons"],result["recommended_store"],result["reply_draft"],"待处理",None,None,stamp,stamp))
        changed+=1
    return changed

def ingest(db,data):
    added=updated=unchanged=0; stamp=now(); source=data.get("source","恢复采集")
    with db:
        for note in data.get("notes",[]):
            record={k:note.get(k) for k in ("note_id","title","url","published_date","institution","summary","comment_count","comment_topics","source_context")}
            raw=json.dumps(record,ensure_ascii=False,sort_keys=True); fp=hashlib.sha256(raw.encode()).hexdigest(); old=db.execute("SELECT fingerprint FROM notes WHERE note_id=?",(record["note_id"],)).fetchone()
            if not old: db.execute("INSERT INTO notes VALUES(?,?,?,?,?,?,?)",(record["note_id"],raw,fp,stamp,stamp,stamp,source)); added+=1
            elif old["fingerprint"]==fp: db.execute("UPDATE notes SET last_seen=? WHERE note_id=?",(stamp,record["note_id"])); unchanged+=1
            else: db.execute("UPDATE notes SET payload=?,fingerprint=?,last_seen=?,changed_at=?,source=? WHERE note_id=?",(raw,fp,stamp,stamp,source,record["note_id"])); updated+=1
        db.execute("INSERT INTO runs VALUES(NULL,?,?,?,?,?,?,?,?,?)",(stamp,source,"成功",len(data.get("notes",[])),added,updated,unchanged,"sample", "")); refresh_lead_queue(db)
    return {"added":added,"updated":updated,"unchanged":unchanged}

def page(title, content):
    return f"""<!doctype html><html lang='zh-CN'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{esc(title)}</title><style>
    :root{{--green:#174d44;--light:#edf5f1;--ink:#1c2825;--muted:#66716d;--line:#dce5e1}}*{{box-sizing:border-box}}body{{margin:0;background:#f5f7f6;color:var(--ink);font:16px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;line-height:1.55}}main{{max-width:1160px;margin:auto;padding:28px 18px 56px}}header{{background:linear-gradient(135deg,#113e36,#1f6657);color:white;padding:28px;border-radius:20px}}h1{{margin:0;font-size:28px}}h2{{margin:0 0 12px}}h3{{margin:10px 0 6px;font-size:18px}}nav{{margin-top:14px;display:flex;gap:12px;flex-wrap:wrap}}nav a{{color:white;text-decoration:none;border:1px solid #ffffff55;padding:6px 10px;border-radius:999px}}section,.card{{background:white;border:1px solid var(--line);border-radius:16px;padding:20px;margin-top:18px;box-shadow:0 4px 20px #18352b0a}}.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}}.stat{{background:var(--light);padding:15px;border-radius:12px}}.stat b{{display:block;font-size:28px;color:var(--green)}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}}.tag{{display:inline-block;background:#edf4f1;color:var(--green);padding:3px 8px;border-radius:999px;font-size:13px;margin-right:5px}}.high{{background:#fff2dc;color:#8b5a13}}.muted,small{{color:var(--muted)}}a{{color:#0a6a58}}label{{display:block;font-weight:600;margin:12px 0 5px}}input,select,textarea{{width:100%;padding:11px;border:1px solid #bfcfc8;border-radius:10px;font:inherit}}textarea{{min-height:92px}}button{{background:var(--green);color:white;border:0;border-radius:10px;padding:11px 16px;font:inherit;cursor:pointer}}.row{{display:flex;gap:10px;align-items:center;flex-wrap:wrap}}.row form{{display:flex;gap:8px;align-items:center;flex-wrap:wrap}}.row select{{width:auto;padding:8px}}.notice{{padding:12px;border-radius:10px;background:#edf5f1;color:#155344}}.warning{{background:#fff2dc;color:#7d5311}}table{{border-collapse:collapse;width:100%}}td,th{{padding:9px;border-bottom:1px solid var(--line);text-align:left}}@media(max-width:600px){{main{{padding:14px}}header{{padding:22px}}}}
    </style><main>{content}</main></html>"""

def header(subtitle="内部获客工作台"):
    return f"<header><h1>伴月轩月子中心</h1><div>{esc(subtitle)}</div><nav><a href='/'>内容情报工作台</a><a href='/review'>每日协作复核</a><a href='/privacy'>数据说明</a></nav></header>"

def dashboard(db,message=""):
    with db: refresh_lead_queue(db)
    rows=db.execute("SELECT q.*,n.payload FROM lead_queue q JOIN notes n ON n.note_id=q.note_id ORDER BY CASE q.status WHEN '待处理' THEN 0 WHEN '已查看' THEN 1 ELSE 2 END,q.score DESC,q.updated_at DESC").fetchall()
    official_rows=db.execute("SELECT n.payload,c.text,c.content_grade,c.reason FROM anonymous_comments c JOIN notes n ON n.note_id=c.note_id WHERE json_extract(n.payload,'$.source_context')='机构官方公开笔记（人工确认）' ORDER BY CASE c.content_grade WHEN 'A类内容线索' THEN 0 WHEN 'B类内容线索' THEN 1 ELSE 2 END,c.id DESC LIMIT 20").fetchall()
    pending=sum(x["status"]=="待处理" for x in rows); hot=sum(x["score"]>=65 and x["status"] in ("待处理","已查看") for x in rows)
    grade_counts={row["content_grade"]:row["n"] for row in db.execute("SELECT content_grade,count(*) n FROM anonymous_comments GROUP BY content_grade")}
    health=health_summary(db); task_counts=health["tasks"]
    cards=f"<section><div class='stats'><div class='stat'>待处理公开需求<b>{pending}</b></div><div class='stat'>高意向笔记<b>{hot}</b></div><div class='stat'>A类评论内容<b>{grade_counts.get('A类内容线索',0)}</b></div><div class='stat'>B类评论内容<b>{grade_counts.get('B类内容线索',0)}</b></div><div class='stat'>推广样式待复核<b>{grade_counts.get('推广样式待人工复核',0)}</b></div></div><p class='muted'>分级针对公开文本，不对账号或个人身份下结论；不保存昵称、用户ID、主页或联系方式。</p></section>"
    lead_html=[]
    for row in rows:
        note=json.loads(row["payload"]); score_class="high" if row["score"]>=65 else ""; owners="<option value=''>未分配</option>"+"".join(f"<option {'selected' if row['owner']==x else ''}>{x}</option>" for x in ("李青","李璐璐")); statuses="".join(f"<option {'selected' if row['status']==x else ''}>{x}</option>" for x in STATUSES)
        comments=db.execute("SELECT text,content_grade,reason FROM anonymous_comments WHERE note_id=? ORDER BY CASE content_grade WHEN 'A类内容线索' THEN 0 WHEN 'B类内容线索' THEN 1 ELSE 2 END,id DESC LIMIT 5",(row['note_id'],)).fetchall()
        comment_html="".join(f"<p><span class='tag'>{esc(x['content_grade'])}</span>{esc(x['text'])}<br><small>{esc(x['reason'])}</small></p>" for x in comments) or "<p class='muted'>尚未采集匿名评论样本</p>"
        lead_html.append(f"<article class='card'><span class='tag {score_class}'>{row['score']}分</span><span class='tag'>{esc(row['intent'])}</span><span class='tag'>{esc(row['recommended_store'])}</span><h3><a href='{esc(note['url'])}' target='_blank' rel='noreferrer'>{esc(note['title'])}</a></h3><small>{esc(note.get('published_date') or '日期未知')} · {esc(note.get('institution'))}</small><p><b>命中原因：</b>{esc(row['reasons'])}</p><p><b>建议：</b>{esc(row['reply_draft'])}</p><details><summary>匿名评论内容样本</summary>{comment_html}</details><form method='post' action='/lead/{esc(row['note_id'])}'><input type='hidden' name='csrf' value='{esc(CSRF)}'><div class='row'><select name='status'>{statuses}</select><select name='owner'>{owners}</select><button>保存处理状态</button></div></form></article>")
    official_html="".join(f"<article class='card'><span class='tag'>{esc(x['content_grade'])}</span><h3><a href='{esc(json.loads(x['payload'])['url'])}' target='_blank' rel='noreferrer'>{esc(json.loads(x['payload'])['title'])}</a></h3><p>{esc(x['text'])}</p><small>{esc(x['reason'])}</small></article>" for x in official_rows) or "<p class='muted'>尚未采集到人工确认官方笔记下的匿名评论内容。</p>"
    alert=f"<p class='notice'>{esc(message)}</p>" if message else ""
    latest=health["latest_run"] or {}
    task_bits=" · ".join(f"{esc(k)} {v}" for k,v in sorted(task_counts.items())) or "暂无评论任务"
    run_bits=(f"最近运行：{esc(latest.get('finished_at') or latest.get('started_at') or '进行中')} · {esc(latest.get('status',''))}" if latest else "尚无新版采集运行记录")
    health_html=f"<section><h2>采集健康</h2><div class='stats'><div class='stat'>最新笔记<b>{esc(health['latest_note_at'] or '—')}</b></div><div class='stat'>评论任务<b>{esc(task_bits)}</b></div></div><p class='muted'>{run_bits}。等待、超时和失败都会保留在此处与日报中，不会被当作空结果。</p></section>"
    return page("伴月轩内容情报工作台",header("第一阶段：公开内容采集与匿名化研判")+cards+health_html+"<section><h2>公开需求处理队列</h2><p class='muted'>仅在小红书官方界面进行人工公开回复；不要根据笔记内容判断客户身份或保存账号资料。</p><div class='grid'>"+"".join(lead_html)+"</div></section>"+f"<section><h2>机构官方公开笔记下的咨询内容</h2><p class='muted'>仅展示人工确认的机构官方公开笔记中，按文本规则分级的匿名评论；不保存昵称、用户ID、头像或主页。</p><div class='grid'>{official_html}</div></section>")

def booking_page(message="",warning=False):
    cfg=config(); alert=f"<p class='notice {'warning' if warning else ''}'>{esc(message)}</p>" if message else ""; options="".join(f"<option value='{esc(k)}'>{esc(v['name'])}</option>" for k,v in cfg['branches'].items()); stores="".join(f"<article class='card'><h3>{esc(v['name'])}</h3><p>{esc(v['address'])}</p><p><b>{esc(v['price_range'])}元</b><br>{esc(v['advantages'])}</p><p class='muted'>咨询：{esc(v['phone'])}</p></article>" for v in cfg['branches'].values())
    form=f"<section><h2>预约到店与免费试吃</h2><p>提交后由对应门店顾问在3小时内联系。到店可领取礼品；参与抖音团购券可享99元抵2000元。</p>{alert}<form method='post' action='/book'><input type='hidden' name='csrf' value='{esc(CSRF)}'><label>称呼 *</label><input name='name' maxlength='40' required autocomplete='name'><label>联系电话 *</label><input name='phone' inputmode='tel' maxlength='20' required autocomplete='tel'><label>意向门店 *</label><select name='store' required>{options}</select><label>预产期月份</label><input type='month' name='expected_month'><label>预算区间</label><select name='budget'><option value='待沟通'>待沟通</option><option>13000-16800元</option><option>16800-21800元</option><option>21800-28800元</option><option>28800元以上</option></select><label>您关注的服务</label><textarea name='interests' maxlength='500' placeholder='例如：探店、房型、月子餐、护理、档期、价格'></textarea><label>来源笔记编号（选填）</label><input name='source_note_id' maxlength='64'><label class='row'><input style='width:auto' type='checkbox' name='consent' value='yes' required>我同意伴月轩月子中心为本次预约与咨询联系我，并已阅读<a href='/privacy' target='_blank'>隐私说明</a>。</label><p><button>提交预约</button></p></form></section>"
    return page("伴月轩预约咨询",header("预约探店 · 免费试吃 · 档期咨询")+"<section><h2>两家门店</h2><div class='grid'>"+stores+"</div></section>"+form)

def privacy_page(): return page("隐私说明",header("隐私说明")+"<section><h2>预约信息使用说明</h2><p>预约页只收集称呼、电话、意向门店、预产期月份、预算和咨询需求，用于安排伴月轩门店顾问联系、探店和试吃服务。</p><p>信息仅供对应门店负责人处理：高新店李青、枣园店李璐璐。客户可要求更正或删除预约信息。</p><p>系统不从小红书采集用户联系方式、账号资料或健康身份；公开笔记仅作为内容研判线索。</p></section>")

def form_data(handler):
    length=int(handler.headers.get("Content-Length","0"))
    if length>10000: raise ValueError("提交内容过大")
    return {k:v[-1] for k,v in parse_qs(handler.rfile.read(length).decode("utf-8","replace"),keep_blank_values=True).items()}

def validate_appointment(data):
    cfg=config()
    if data.get("csrf")!=CSRF: raise ValueError("页面已过期，请刷新后重试")
    name=clean(data.get("name"),40); phone=re.sub(r"\s+","",clean(data.get("phone"),20)); store=clean(data.get("store"),30); month=clean(data.get("expected_month"),7)
    if not name or not re.fullmatch(r"1\d{10}",phone): raise ValueError("请填写称呼和有效的11位手机号")
    if store not in cfg["branches"]: raise ValueError("请选择有效门店")
    if data.get("consent")!="yes": raise ValueError("需要同意联系说明后才能提交")
    if month and not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])",month): raise ValueError("预产期月份格式不正确")
    return {"name":name,"phone":phone,"store":store,"expected_month":month,"budget":clean(data.get("budget"),30) or "待沟通","interests":clean(data.get("interests"),500) or "未填写","source_note_id":clean(data.get("source_note_id"),64) or None}

def save_appointment(db, info):
    branch=config()["branches"][info["store"]]; stamp=now()
    with db: db.execute("INSERT INTO appointments(name,phone,store,expected_month,budget,interests,source_note_id,consent_at,owner,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",(info["name"],info["phone"],info["store"],info["expected_month"],info["budget"],info["interests"],info["source_note_id"],stamp,branch["owner"],"新线索",stamp,stamp))
    return branch

class Handler(BaseHTTPRequestHandler):
    def send_html(self,body,status=200):
        raw=body.encode(); self.send_response(status); self.send_header("Content-Type","text/html; charset=utf-8"); self.send_header("Content-Length",str(len(raw))); self.send_header("X-Content-Type-Options","nosniff"); self.send_header("Referrer-Policy","same-origin"); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        path=urlparse(self.path).path; db=connect()
        try:
            if path in ("/","/index.html"): self.send_html(dashboard(db))
            elif path=="/candidates":
                self.send_html((ROOT/'reports/candidate-notes.html').read_text(encoding='utf-8'))
            elif path=="/review":
                import review_web
                date=parse_qs(urlparse(self.path).query).get('date',[None])[0]
                self.send_html(review_web.page(db,date))
            elif path=="/book": self.send_html(booking_page())
            elif path=="/privacy": self.send_html(privacy_page())
            else: self.send_error(404)
        finally: db.close()
    def do_POST(self):
        path=urlparse(self.path).path; db=connect()
        try:
            data=form_data(self)
            if path=="/review/save":
                import review_web
                review_web.save(db,data)
                self.send_html(review_web.page(db,data.get('date'),"已保存；同事的复核记录也会保留。"))
            elif path=="/book":
                branch=save_appointment(db,validate_appointment(data)); self.send_html(booking_page(f"预约已提交。{branch['name']}顾问{branch['owner']}将在3小时内联系您。"))
            elif path.startswith("/lead/"):
                note_id=path.rsplit("/",1)[-1]; status=clean(data.get("status"),20); owner=clean(data.get("owner"),20) or None
                if data.get("csrf")!=CSRF or not re.fullmatch(r"[0-9a-f]{24}",note_id) or status not in STATUSES or owner not in (None,"李青","李璐璐"): raise ValueError("请求无效，请刷新后重试")
                with db: db.execute("UPDATE lead_queue SET status=?,owner=?,handled_at=?,updated_at=? WHERE note_id=?",(status,owner,now(),now(),note_id))
                self.send_html(dashboard(db,"线索处理状态已保存。"))
            else: self.send_error(404)
        except (ValueError,sqlite3.IntegrityError) as exc: self.send_html(booking_page(str(exc),True) if path=="/book" else page("请求失败",header()+f"<section><p class='notice warning'>{esc(exc)}</p></section>"),400)
        finally: db.close()
    def log_message(self,*args): pass

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("command",choices=["serve","report","refresh-leads"]); parser.add_argument("--port",type=int,default=8766); args=parser.parse_args(); db=connect()
    if args.command=="report":
        out=ROOT/"reports/market.html"; out.parent.mkdir(exist_ok=True); out.write_text(dashboard(db),encoding="utf-8"); print(out); db.close()
    elif args.command=="refresh-leads":
        with db: print(refresh_lead_queue(db))
        db.close()
    else:
        db.close(); print(f"本地看板：http://127.0.0.1:{args.port}",flush=True); ThreadingHTTPServer(("127.0.0.1",args.port),Handler).serve_forever()
if __name__=="__main__": main()
