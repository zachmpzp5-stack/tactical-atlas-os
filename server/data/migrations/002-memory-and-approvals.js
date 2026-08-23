export default {
  version: 2,
  name: 'memory_and_approvals',
  statements: [
    `CREATE TABLE IF NOT EXISTS tain_records (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      source_id UUID REFERENCES evidence_sources(id) ON DELETE SET NULL,
      mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
      verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED','UNVERIFIED','DISPUTED')),
      confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
      classification TEXT NOT NULL,
      retention_setting TEXT NOT NULL CHECK (retention_setting IN ('MISSION','STANDARD','EXTENDED','PERMANENT')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      search_document TSVECTOR GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title,'')), 'A') || setweight(to_tsvector('english', coalesce(content,'')), 'B') || setweight(to_tsvector('english', coalesce(source,'')), 'C')) STORED
    )`,
    `CREATE INDEX IF NOT EXISTS tain_records_search_idx ON tain_records USING GIN(search_document)`,
    `CREATE TABLE IF NOT EXISTS lyra_conversations (
      id UUID PRIMARY KEY,
      commander_binding_hash TEXT,
      clearance TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS lyra_messages (
      id UUID PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES lyra_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('USER','LYRA','SYSTEM')),
      content TEXT NOT NULL,
      fact_classification JSONB NOT NULL DEFAULT '{}'::jsonb,
      evidence_references JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS proposed_actions (
      id UUID PRIMARY KEY,
      mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      proposed_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS commander_approvals (
      id UUID PRIMARY KEY,
      proposed_action_id UUID NOT NULL REFERENCES proposed_actions(id) ON DELETE RESTRICT,
      decision TEXT NOT NULL CHECK (decision IN ('APPROVED','REJECTED')),
      commander_actor TEXT NOT NULL,
      reason TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      UNIQUE(proposed_action_id)
    )`
  ]
};
