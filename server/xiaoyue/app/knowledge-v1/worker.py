"""Local deterministic candidate generation. No external model, no outbound replies."""
import argparse
import json
import os
import pathlib
import re
import time
from datetime import timedelta


def normalize(text):
    return re.sub(r'\s+', '', text or '')


def split_quote(text):
    patterns = [
        r'^这是一条引用/回复消息：\s*"([^\n]+)\n(.*?)"\s*\n[- ]{3,}\s*\n(.*)$',
        r'^「([^：\n]+)：\s*\n?(.*?)」\s*\n[- ]{3,}\s*\n(.*)$',
    ]
    for pattern in patterns:
        match = re.match(pattern, text.strip(), re.S)
        if match:
            name, question, answer = (x.strip() for x in match.groups())
            return name, question, answer
    return None


def classify(question):
    groups = [
        ('疫苗问题', ['疫苗', '接种']),
        ('皮肤问题', ['皮肤', '皮疹', '湿疹', '红点', '红斑', '疙瘩', '癣', '藓']),
        ('大便问题', ['大便', '便秘', '便血', '腹泻', '排便']),
        ('喂养问题', ['喂养', '吃奶', '奶粉', '母乳', '拒奶', '厌奶', '转奶']),
        ('产妇护理', ['恶露', '乳房', '会阴', '产妇']),
    ]
    matches = [(category, [w for w in words if w in question]) for category, words in groups]
    hits = [(category, words) for category, words in matches if words]
    return (hits[0][0] if hits else '其他问题', [word for _, words in hits for word in words])


def candidates(messages, attachments, config):
    revoked = {m['content'].get('pre_msgid') for m in messages if m['message_type'] == 'revoke'}
    active = [m for m in messages if m['external_message_id'] not in revoked]
    for reply in active:
        if reply['sender_id'] not in config['responders'] or reply['message_type'] != 'text':
            continue
        parsed = split_quote(reply['content'].get('content', ''))
        if not parsed:
            continue
        name, quoted, answer = parsed
        # Only an exact normalized quote uniquely identifying a recent message can auto-pair.
        options = [q for q in active if q['conversation_id'] == reply['conversation_id']
                   and q['sender_id'] not in config['staff'] and q['message_type'] == 'text'
                   and timedelta(0) <= reply['message_time'] - q['message_time'] <= timedelta(days=7)
                   and q['id'] != reply['id']
                   and normalize(q['content'].get('content', '')) == normalize(quoted)]
        question = options[0] if len(options) == 1 else None
        media = []
        if question:
            # Media proximity is a suggestion, never asserted as a structured reply relation.
            for m in active:
                if (m['conversation_id'] == reply['conversation_id']
                    and m['sender_id'] == question['sender_id']
                    and question['message_time'] - timedelta(minutes=2) <= m['message_time'] <= min(
                        question['message_time'] + timedelta(minutes=5), reply['message_time'])):
                    media.extend(a['id'] for a in attachments if a['message_id'] == m['id'])
        category, tags = classify(quoted)
        risks = [word for word in ['诊断', '用药', '乳膏', '地奈德', '剂量', '排除', '就医', '发热', '便血'] if word in answer]
        yield dict(answer_message_id=reply['id'], question_message_id=question['id'] if question else None,
                   room_id=reply['conversation_id'], customer_id=question['sender_id'] if question else None,
                   responder_id=reply['sender_id'], question=quoted, answer=answer, category=category,
                   tags=tags, attachment_ids=sorted(set(media)), evidence={
                       'version': 1, 'quote_name': name, 'match': 'unique_exact_quote' if question else 'unresolved',
                       'matching_questions': len(options), 'answer_sequence': reply['sequence_number'],
                       'question_sequence': question['sequence_number'] if question else None,
                       'media_relation': 'same_sender_time_window_requires_review',
                       'review_flags': risks, 'classification': 'keyword_rules_not_medical_diagnosis'})


def connect():
    import psycopg
    from psycopg.rows import dict_row
    return psycopg.connect(host=os.getenv('PGHOST', 'postgres'), dbname=os.environ['POSTGRES_DB'],
                          user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'],
                          connect_timeout=10, row_factory=dict_row)


def generate(config):
    from psycopg.types.json import Jsonb
    with connect() as conn:
        # Serialize manual scans and background scans.
        conn.execute('SELECT pg_advisory_xact_lock(7392051)')
        messages = conn.execute('SELECT * FROM xiaoyue.messages WHERE conversation_id = ANY(%s) ORDER BY message_time,id',
                                (config['rooms'],)).fetchall()
        attachments = conn.execute('SELECT a.id,a.message_id FROM xiaoyue.attachments a JOIN xiaoyue.messages m ON m.id=a.message_id WHERE m.conversation_id = ANY(%s)',
                                   (config['rooms'],)).fetchall()
        count = 0
        for item in candidates(messages, attachments, config):
            fields = list(item)
            values = [Jsonb(v) if isinstance(v, (dict, list)) else v for v in item.values()]
            result = conn.execute('INSERT INTO xiaoyue.knowledge_candidates (' + ','.join(fields) + ') VALUES (' +
                                  ','.join(['%s'] * len(fields)) + ') ON CONFLICT(answer_message_id) DO NOTHING RETURNING id', values)
            count += len(result.fetchall())
        # Source recalls invalidate even previously reviewed items; never silently republish them.
        conn.execute("""UPDATE xiaoyue.knowledge_candidates c SET status='invalidated',updated_at=now()
            WHERE c.status <> 'invalidated' AND EXISTS (
              SELECT 1 FROM xiaoyue.messages r JOIN xiaoyue.messages s
              ON s.external_message_id=r.content->>'pre_msgid'
              WHERE r.message_type='revoke' AND (s.id=c.question_message_id OR s.id=c.answer_message_id
                OR EXISTS(SELECT 1 FROM xiaoyue.attachments a WHERE a.message_id=s.id
                  AND c.attachment_ids @> jsonb_build_array(a.id))))""")
    return count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['run', 'scan', 'list', 'show', 'approve', 'reject', 'search'])
    parser.add_argument('--id', type=int)
    parser.add_argument('--reviewer')
    parser.add_argument('--note')
    parser.add_argument('--answer-file')
    parser.add_argument('--query', default='')
    args = parser.parse_args()
    config = json.loads(pathlib.Path('/knowledge/config.json').read_text())
    if args.command in ('run', 'scan'):
        while True:
            try:
                count = generate(config)
                pathlib.Path('/tmp/knowledge-heartbeat').touch()
                if count or args.command == 'scan':
                    print(json.dumps({'new_candidates': count}), flush=True)
            except Exception as exc:
                print('candidate scan failed: ' + type(exc).__name__, flush=True)
                if args.command == 'scan':
                    raise SystemExit(1)
            if args.command == 'scan':
                return
            time.sleep(config.get('poll_seconds', 60))
    with connect() as conn:
        if args.command == 'list':
            rows = conn.execute('SELECT id,category,status,customer_id,responder_id,evidence FROM xiaoyue.knowledge_candidates ORDER BY id DESC LIMIT 50').fetchall()
        elif args.command == 'search':
            rows = conn.execute("SELECT id,category,question,reviewed_answer FROM xiaoyue.knowledge_candidates WHERE status='approved' AND (strpos(question,%s)>0 OR strpos(reviewed_answer,%s)>0) ORDER BY id DESC LIMIT 20", (args.query,args.query)).fetchall()
        elif args.command == 'show':
            if not args.id:
                parser.error('--id required')
            rows = conn.execute('SELECT * FROM xiaoyue.knowledge_candidates WHERE id=%s', (args.id,)).fetchall()
        else:
            if not args.id or not args.reviewer or not args.note:
                parser.error('--id --reviewer --note required')
            item = conn.execute('SELECT * FROM xiaoyue.knowledge_candidates WHERE id=%s FOR UPDATE', (args.id,)).fetchone()
            if not item or item['status'] != 'pending':
                parser.error('candidate must exist and be pending')
            answer = None
            if args.command == 'approve':
                if not item['question_message_id'] or not args.answer_file:
                    parser.error('approval requires matched question and --answer-file with reviewed answer')
                answer = pathlib.Path(args.answer_file).read_text().strip()
                if not answer:
                    parser.error('reviewed answer is empty')
            status = 'approved' if args.command == 'approve' else 'rejected'
            conn.execute('UPDATE xiaoyue.knowledge_candidates SET status=%s,reviewed_answer=%s,reviewer=%s,review_note=%s,reviewed_at=now(),updated_at=now() WHERE id=%s',
                         (status,answer,args.reviewer,args.note,args.id))
            conn.execute('INSERT INTO xiaoyue.knowledge_review_log(candidate_id,action,reviewer,note,reviewed_answer) VALUES(%s,%s,%s,%s,%s)',
                         (args.id,status,args.reviewer,args.note,answer))
            rows = [{'id':args.id,'status':status}]
        print(json.dumps(rows, ensure_ascii=False, default=str, indent=2))


if __name__ == '__main__':
    main()
