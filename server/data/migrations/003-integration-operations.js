export default {
  version: 3,
  name: 'integration_operations',
  statements: [
    `CREATE TABLE IF NOT EXISTS integration_sync_runs (
      id UUID PRIMARY KEY,
      provider TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PENDING','RUNNING','SUCCEEDED','FAILED','REAUTHORIZATION_REQUIRED','DISCONNECTED','NOT_CONFIGURED')),
      current_step TEXT NOT NULL,
      completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      idempotency_key TEXT NOT NULL UNIQUE,
      last_error_code TEXT,
      next_retry_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      completed_at TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS integration_records (
      id UUID PRIMARY KEY,
      provider TEXT NOT NULL,
      external_id TEXT NOT NULL,
      record_type TEXT NOT NULL,
      normalized_data JSONB NOT NULL,
      retrieved_at TIMESTAMPTZ NOT NULL,
      source_endpoint TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      sync_run_id UUID REFERENCES integration_sync_runs(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      UNIQUE(provider, external_id, record_type)
    )`,
    `CREATE INDEX IF NOT EXISTS integration_sync_runs_provider_started_idx ON integration_sync_runs(provider,started_at DESC)`,
    `CREATE INDEX IF NOT EXISTS integration_records_provider_retrieved_idx ON integration_records(provider,retrieved_at DESC)`
  ]
};
