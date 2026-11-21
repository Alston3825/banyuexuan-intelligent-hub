BEGIN;
CREATE TABLE IF NOT EXISTS xiaoyue_curated.intake_keys (
 room_id text NOT NULL, source_key text NOT NULL, kind text NOT NULL CHECK(kind IN ('question','answer')),
 entity_id bigint NOT NULL, case_id bigint NOT NULL REFERENCES xiaoyue_curated.case_bundles(id),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(room_id,kind,source_key)
);
CREATE TABLE IF NOT EXISTS xiaoyue_curated.intake_runs (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, room_id text NOT NULL,
 payload jsonb NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION xiaoyue_curated.ingest_review(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $f$
DECLARE
 room text := p->>'room_id'; c jsonb; q jsonb; a jsonb; l jsonb; s text;
 person bigint; bundle bigint; question bigint; answer bigint; message bigint;
 author bigint; msgtime timestamptz; firsttime timestamptz; keytext text; mappedcase bigint;
BEGIN
 IF room IS DISTINCT FROM 'wrPPybcQAAh0UjrU0aSK-BdQpYi9kdFg' THEN RAISE EXCEPTION 'Unsupported room'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('xiaoyue-intake:'||room,0));
 FOR c IN SELECT value FROM jsonb_array_elements(p->'cases') LOOP
  IF c->>'customer_sender_id' IS NULL OR c->>'first_question_sequence' IS NULL THEN RAISE EXCEPTION 'Missing customer or anchor'; END IF;
  SELECT id,message_time INTO message,firsttime FROM xiaoyue.messages WHERE conversation_id=room AND sequence_number=(c->>'first_question_sequence')::bigint AND sender_id=c->>'customer_sender_id';
  IF message IS NULL THEN RAISE EXCEPTION 'Anchor not found'; END IF;
  SELECT person_id INTO person FROM xiaoyue_curated.accounts WHERE sender_id=c->>'customer_sender_id';
  IF person IS NULL THEN
   INSERT INTO xiaoyue_curated.people(role,internal_label) VALUES('customer',c->>'customer_label') RETURNING id INTO person;
   INSERT INTO xiaoyue_curated.accounts(sender_id,person_id,account_type) VALUES(c->>'customer_sender_id',person,'unknown');
  END IF;
  IF (SELECT role FROM xiaoyue_curated.people WHERE id=person)<>'customer' THEN RAISE EXCEPTION 'Customer role mismatch'; END IF;
  SELECT id INTO bundle FROM xiaoyue_curated.case_bundles WHERE room_id=room AND customer_id=person AND firsttime>=first_question_at AND firsttime<window_end ORDER BY first_question_at LIMIT 1;
  IF bundle IS NULL THEN
   IF EXISTS(SELECT 1 FROM xiaoyue_curated.case_bundles WHERE room_id=room AND customer_id=person AND first_question_at<firsttime+interval '24 hours' AND window_end>firsttime) THEN RAISE EXCEPTION 'Overlapping anchor requires review'; END IF;
   INSERT INTO xiaoyue_curated.case_bundles(room_id,customer_id,first_question_at,window_end) VALUES(room,person,firsttime,firsttime+interval '24 hours') RETURNING id INTO bundle;
  END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(c->'questions') LOOP
   keytext:=q->>'key';
   IF keytext IS NULL THEN RAISE EXCEPTION 'Missing question key'; END IF;
   SELECT entity_id,case_id INTO question,mappedcase FROM xiaoyue_curated.intake_keys WHERE room_id=room AND kind='question' AND source_key=keytext;
   IF question IS NULL THEN
    INSERT INTO xiaoyue_curated.questions(case_id,summary,answer_status) VALUES(bundle,q->>'summary','unanswered') RETURNING id INTO question;
    INSERT INTO xiaoyue_curated.intake_keys VALUES(room,keytext,'question',question,bundle,now());
   ELSIF mappedcase<>bundle THEN RAISE EXCEPTION 'Question case mismatch'; END IF;
   FOR s IN SELECT jsonb_array_elements_text(q->'sequences') LOOP
    SELECT id INTO message FROM xiaoyue.messages WHERE conversation_id=room AND sequence_number=s::bigint;
    IF message IS NULL THEN RAISE EXCEPTION 'Question source missing %',s; END IF;
    INSERT INTO xiaoyue_curated.evidence(case_id,question_id,message_id,purpose,relation,note) VALUES(bundle,question,message,'question','manual','每日整理录入；原始信息不改写') ON CONFLICT DO NOTHING;
   END LOOP;
   FOR s IN SELECT jsonb_array_elements_text(q->'categories') LOOP
    INSERT INTO xiaoyue_curated.question_categories(question_id,category_id) SELECT question,id FROM xiaoyue_curated.categories WHERE name=s ON CONFLICT DO NOTHING;
   END LOOP;
  END LOOP;
  FOR a IN SELECT value FROM jsonb_array_elements(c->'answers') LOOP
   SELECT m.id,m.message_time,ac.person_id INTO message,msgtime,author FROM xiaoyue.messages m JOIN xiaoyue_curated.accounts ac ON ac.sender_id=m.sender_id JOIN xiaoyue_curated.people pe ON pe.id=ac.person_id AND pe.role='director' WHERE m.conversation_id=room AND m.sequence_number=(a->>'sequence')::bigint;
   IF message IS NULL THEN RAISE EXCEPTION 'Director source missing'; END IF;
   keytext:=a->>'sequence';
   SELECT entity_id,case_id INTO answer,mappedcase FROM xiaoyue_curated.intake_keys WHERE room_id=room AND kind='answer' AND source_key=keytext;
   IF answer IS NULL THEN
    INSERT INTO xiaoyue_curated.answers(case_id,responder_id,summary,state) VALUES(bundle,author,a->>'summary','draft') RETURNING id INTO answer;
    INSERT INTO xiaoyue_curated.intake_keys VALUES(room,keytext,'answer',answer,bundle,now());
   ELSIF mappedcase<>bundle THEN RAISE EXCEPTION 'Answer case mismatch'; END IF;
   INSERT INTO xiaoyue_curated.evidence(case_id,answer_id,message_id,purpose,relation) VALUES(bundle,answer,message,'answer','explicit') ON CONFLICT DO NOTHING;
   FOR l IN SELECT value FROM jsonb_array_elements(a->'links') LOOP
    SELECT entity_id INTO question FROM xiaoyue_curated.intake_keys WHERE room_id=room AND kind='question' AND source_key=l->>'question_key' AND case_id=bundle;
    IF question IS NULL THEN RAISE EXCEPTION 'Link target missing'; END IF;
    INSERT INTO xiaoyue_curated.answer_links(case_id,question_id,answer_id,relation,coverage) VALUES(bundle,question,answer,l->>'relation',l->>'coverage') ON CONFLICT DO NOTHING;
   END LOOP;
  END LOOP;
  FOR s IN SELECT jsonb_array_elements_text(c->'feedback_sequences') LOOP
   SELECT id INTO message FROM xiaoyue.messages WHERE conversation_id=room AND sequence_number=s::bigint;
   IF message IS NULL THEN RAISE EXCEPTION 'Feedback missing'; END IF;
   INSERT INTO xiaoyue_curated.evidence(case_id,message_id,purpose,relation) VALUES(bundle,message,'feedback','manual') ON CONFLICT DO NOTHING;
  END LOOP;
 END LOOP;
 -- Recompute coverage excluding recalled answers; pending association remains uncertain.
 UPDATE xiaoyue_curated.answers a SET state='withdrawn' FROM xiaoyue_curated.case_bundles b WHERE b.id=a.case_id AND b.room_id=room AND EXISTS(SELECT 1 FROM xiaoyue_curated.evidence e JOIN xiaoyue.messages m ON m.id=e.message_id JOIN xiaoyue.messages r ON r.conversation_id=m.conversation_id AND r.message_type='revoke' AND r.content->>'pre_msgid'=m.external_message_id WHERE e.answer_id=a.id AND e.purpose='answer');
 UPDATE xiaoyue_curated.questions q SET answer_status=CASE
  WHEN EXISTS(SELECT 1 FROM xiaoyue_curated.answer_links l JOIN xiaoyue_curated.answers a ON a.id=l.answer_id WHERE l.question_id=q.id AND a.state<>'withdrawn' AND l.coverage='full' AND (l.relation='explicit_quote' OR l.confirmed_at IS NOT NULL)) THEN 'answered'
  WHEN EXISTS(SELECT 1 FROM xiaoyue_curated.answer_links l JOIN xiaoyue_curated.answers a ON a.id=l.answer_id WHERE l.question_id=q.id AND a.state<>'withdrawn' AND l.coverage='partial') THEN 'partial'
  WHEN EXISTS(SELECT 1 FROM xiaoyue_curated.answer_links l JOIN xiaoyue_curated.answers a ON a.id=l.answer_id WHERE l.question_id=q.id AND a.state<>'withdrawn') THEN 'uncertain' ELSE 'unanswered' END
 FROM xiaoyue_curated.case_bundles b WHERE b.id=q.case_id AND b.room_id=room AND q.answer_status<>'withdrawn';
 INSERT INTO xiaoyue_curated.intake_runs(room_id,payload) VALUES(room,p);
 RETURN jsonb_build_object('case_payload_count',jsonb_array_length(p->'cases'),'status','recorded_internal');
END $f$;
REVOKE ALL ON FUNCTION xiaoyue_curated.ingest_review(jsonb) FROM PUBLIC;
COMMIT;
