BEGIN;

CREATE TABLE IF NOT EXISTS xiaoyue.archive_state (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    last_sequence BIGINT NOT NULL DEFAULT 0 CHECK (last_sequence >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO xiaoyue.archive_state (singleton, last_sequence)
VALUES (TRUE, 0)
ON CONFLICT (singleton) DO NOTHING;

ALTER TABLE xiaoyue.messages
    ADD COLUMN IF NOT EXISTS public_key_version INTEGER;

COMMIT;
