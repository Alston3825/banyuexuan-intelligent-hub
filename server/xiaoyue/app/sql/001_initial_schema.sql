BEGIN;

CREATE SCHEMA IF NOT EXISTS xiaoyue;

CREATE TABLE IF NOT EXISTS xiaoyue.messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_message_id TEXT NOT NULL UNIQUE,
    sequence_number BIGINT,
    conversation_id TEXT,
    sender_id TEXT NOT NULL,
    sender_type TEXT,
    message_type TEXT NOT NULL,
    message_time TIMESTAMPTZ NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_time_idx
    ON xiaoyue.messages (conversation_id, message_time);
CREATE INDEX IF NOT EXISTS messages_sender_time_idx
    ON xiaoyue.messages (sender_id, message_time);

CREATE TABLE IF NOT EXISTS xiaoyue.attachments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES xiaoyue.messages(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL,
    original_name TEXT,
    storage_provider TEXT,
    storage_key TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attachments_message_idx
    ON xiaoyue.attachments (message_id);

CREATE TABLE IF NOT EXISTS xiaoyue.knowledge_pairs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_message_id BIGINT REFERENCES xiaoyue.messages(id) ON DELETE SET NULL,
    answer_message_id BIGINT REFERENCES xiaoyue.messages(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    confidence NUMERIC(5,4),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
