"""Authenticated, isolated shared review service."""
import base64
import hmac
import os
from http.server import ThreadingHTTPServer
from urllib.parse import parse_qs,urlparse
import app
import review_web
import note_review

class Handler(app.Handler):
    def authorized(self):
        expected='Basic '+base64.b64encode(('review:'+os.environ['REVIEW_PASSWORD']).encode()).decode()
        if hmac.compare_digest(self.headers.get('Authorization',''),expected): return True
        self.send_response(401);self.send_header('WWW-Authenticate','Basic realm="Banyuexuan Review", charset="UTF-8"');self.end_headers()
        return False
    def do_GET(self):
        if not self.authorized(): return
        path=urlparse(self.path).path
        if path=='/acceptance':
            from pathlib import Path
            import re
            run=parse_qs(urlparse(self.path).query).get('run',[''])[0]
            if not re.fullmatch(r'202[0-9]-[0-9]{2}-[0-9]{2}-[0-9]{6}',run):self.send_error(400);return
            report=Path('/app/data')/('acceptance-'+run+'.html')
            if not report.exists():self.send_error(404);return
            self.send_html(report.read_text());return
        if path=='/statistics':
            from pathlib import Path
            import re
            day=parse_qs(urlparse(self.path).query).get('date',[''])[0]
            if not re.fullmatch(r'202[0-9]-[0-9]{2}-[0-9]{2}',day):self.send_error(400);return
            report=Path('/app/data')/(day+'-内容统计V3.html')
            if not report.exists():self.send_error(404);return
            self.send_html(report.read_text());return
        if path not in ('/','/review','/notes'):
            self.send_error(404);return
        db=app.connect()
        try:
            renderer=note_review.page if path=='/notes' else review_web.page
            query=parse_qs(urlparse(self.path).query)
            if path=='/notes':self.send_html(renderer(db,query.get('date',[None])[0]))
            else:self.send_html(renderer(db,query.get('date',[None])[0],note_id=query.get('note_id',[None])[0],batch=query.get('batch',[None])[0]))
        except ValueError: self.send_error(400)
        finally:db.close()
    def do_POST(self):
        if not self.authorized():return
        path=urlparse(self.path).path
        if path not in ('/review/save','/notes/save'):self.send_error(404);return
        db=app.connect()
        try:
            data=app.form_data(self)
            module=note_review if path=='/notes/save' else review_web
            module.save(db,data)
            message='复核已保存，其他同事的记录保持不变。'
            if path=='/review/save':self.send_html(module.page(db,data.get('date'),message,note_id=data.get('note_id','').strip() or None))
            else:self.send_html(module.page(db,data.get('date'),message))
        except (ValueError,TypeError):self.send_error(400,'Invalid review submission')
        finally:db.close()
    def send_html(self,body,status=200):
        prefix=os.environ.get('REVIEW_PATH_PREFIX','')
        body=body.replace("href='/privacy'","href='/notes'")
        body=body.replace("</nav>","<a href='/notes'>笔记核验</a></nav>")
        for path in ('/review/save','/notes/save','/review','/notes','/'):
            for attr in ('href','action'):
                body=body.replace(f"{attr}='{path}'",f"{attr}='{prefix}{path}'")
        super().send_html(body,status)

if __name__=='__main__':
    if not os.environ.get('REVIEW_PASSWORD'):raise SystemExit('Missing REVIEW_PASSWORD')
    ThreadingHTTPServer(('0.0.0.0',8767),Handler).serve_forever()
