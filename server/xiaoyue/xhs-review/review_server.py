"""Authenticated, isolated shared review service."""
import base64
import hmac
import os
from http.server import ThreadingHTTPServer
from urllib.parse import parse_qs,urlparse
import app
import review_web

class Handler(app.Handler):
    def authorized(self):
        expected='Basic '+base64.b64encode(('review:'+os.environ['REVIEW_PASSWORD']).encode()).decode()
        if hmac.compare_digest(self.headers.get('Authorization',''),expected): return True
        self.send_response(401);self.send_header('WWW-Authenticate','Basic realm="Banyuexuan Review", charset="UTF-8"');self.end_headers()
        return False
    def do_GET(self):
        if not self.authorized(): return
        if urlparse(self.path).path not in ('/','/review'):
            self.send_error(404);return
        db=app.connect()
        try: self.send_html(review_web.page(db,parse_qs(urlparse(self.path).query).get('date',[None])[0]))
        except ValueError: self.send_error(400)
        finally:db.close()
    def do_POST(self):
        if not self.authorized():return
        if urlparse(self.path).path!='/review/save':self.send_error(404);return
        db=app.connect()
        try:
            data=app.form_data(self);review_web.save(db,data)
            self.send_html(review_web.page(db,data.get('date'),'复核已保存，其他同事的记录保持不变。'))
        except (ValueError,TypeError):self.send_error(400,'Invalid review submission')
        finally:db.close()
    def send_html(self,body,status=200):
        body=body.replace("href='/'","href='/xhs-review/'").replace("href='/review'","href='/xhs-review/review'").replace("href='/privacy'","href='/xhs-review/'").replace("action='/review'","action='/xhs-review/review'").replace("action='/review/save'","action='/xhs-review/review/save'")
        super().send_html(body,status)

if __name__=='__main__':
    if not os.environ.get('REVIEW_PASSWORD'):raise SystemExit('Missing REVIEW_PASSWORD')
    ThreadingHTTPServer(('0.0.0.0',8767),Handler).serve_forever()
