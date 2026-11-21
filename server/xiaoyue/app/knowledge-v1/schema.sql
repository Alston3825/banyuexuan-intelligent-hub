BEGIN;
CREATE TABLE IF NOT EXISTS xiaoyue.knowledge_candidates (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 answer_message_id BIGINT NOT NULL UNIQUE REFERENCES xiaoyue.messages(id),
 question_message_id BIGINT REFERENCES xiaoyue.messages(id),
 room_id TEXT NOT NULL,
 customer_id TEXT,
 responder_id TEXT NOT NULL,
 question TEXT NOT NULL,
 answer TEXT NOT NULL,
 category TEXT NOT NULL,
 tags JSONB NOT NULL DEFAULT '[]',
 attachment_ids JSONB NOT NULL DEFAULT '[]',
 evidence JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','invalidated')),
 reviewed_answer TEXT,
 reviewer TEXT,
 review_note TEXT,
 reviewed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS xiaoyue.knowledge_review_log (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 candidate_id BIGINT NOT NULL REFERENCES xiaoyue.knowledge_candidates(id),
 action TEXT NOT NULL,
 reviewer TEXT NOT NULL,
 note TEXT NOT NULL,
 reviewed_answer TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
