export default {
  version: 1,
  name: 'command_core',
  statements: [
    `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
    `CREATE TABLE IF NOT EXISTS missions (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
      summary TEXT NOT NULL DEFAULT '' CHECK (char_length(summary) <= 4000),
      state TEXT NOT NULL CHECK (state IN ('DRAFT','REVIEW','APPROVED','ACTIVE','BLOCKED','COMPLETE','ARCHIVED')),
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS mission_events (
      id UUID PRIMARY KEY,
      mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      previous_state TEXT,
      next_state TEXT NOT NULL,
      actor TEXT NOT NULL,
      reason TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS objectives (
      id UUID PRIMARY KEY,
      mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 240),
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','BLOCKED','COMPLETE')),
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS evidence_sources (
      id UUID PRIMARY KEY,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      locator TEXT NOT NULL,
      retrieved_at TIMESTAMPTZ,
      verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED','UNVERIFIED','DISPUTED','UNAVAILABLE')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS evidence (
      id UUID PRIMARY KEY,
      mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
      source_id UUID NOT NULL REFERENCES evidence_sources(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      classification TEXT NOT NULL DEFAULT 'INTERNAL',
      confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`,
    `CREATE TABLE IF NOT EXISTS security_audit_events (
      sequence BIGSERIAL PRIMARY KEY,
      id UUID NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      previous_hash TEXT,
      event_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL
    )`,
    `CREATE OR REPLACE FUNCTION atlas_reject_audit_mutation() RETURNS TRIGGER AS $$
      BEGIN RAISE EXCEPTION 'security_audit_events are immutable'; END;
    $$ LANGUAGE plpgsql`,
    `DROP TRIGGER IF EXISTS security_audit_events_immutable ON security_audit_events`,
    `CREATE TRIGGER security_audit_events_immutable BEFORE UPDATE OR DELETE ON security_audit_events
      FOR EACH ROW EXECUTE FUNCTION atlas_reject_audit_mutation()`,
    `CREATE OR REPLACE FUNCTION atlas_append_audit(
      p_id UUID, p_event_type TEXT, p_entity_type TEXT, p_entity_id TEXT,
      p_actor TEXT, p_action TEXT, p_payload JSONB
    ) RETURNS security_audit_events AS $$
      DECLARE v_previous TEXT; v_hash TEXT; v_created TIMESTAMPTZ; v_row security_audit_events;
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtext('tactical_atlas_security_audit'));
        SELECT event_hash INTO v_previous FROM security_audit_events ORDER BY sequence DESC LIMIT 1;
        v_created := clock_timestamp();
        v_hash := encode(digest(concat_ws('|', coalesce(v_previous, ''), p_id::text, p_event_type,
          p_entity_type, coalesce(p_entity_id, ''), p_actor, p_action, p_payload::text,
          to_char(v_created AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')), 'sha256'), 'hex');
        INSERT INTO security_audit_events(id,event_type,entity_type,entity_id,actor,action,payload,previous_hash,event_hash,created_at)
        VALUES (p_id,p_event_type,p_entity_type,p_entity_id,p_actor,p_action,p_payload,v_previous,v_hash,v_created)
        RETURNING * INTO v_row;
        RETURN v_row;
      END;
    $$ LANGUAGE plpgsql`,
    `CREATE OR REPLACE FUNCTION atlas_create_mission(
      p_mission_id UUID, p_event_id UUID, p_audit_id UUID, p_title TEXT, p_summary TEXT,
      p_actor TEXT, p_reason TEXT, p_idempotency_key TEXT
    ) RETURNS JSONB AS $$
      DECLARE v_mission missions; v_existing UUID;
      BEGIN
        SELECT mission_id INTO v_existing FROM mission_events WHERE idempotency_key = p_idempotency_key;
        IF v_existing IS NOT NULL THEN
          SELECT * INTO v_mission FROM missions WHERE id = v_existing;
          RETURN to_jsonb(v_mission) || jsonb_build_object('idempotent', true);
        END IF;
        INSERT INTO missions(id,title,summary,state,created_by) VALUES(p_mission_id,p_title,p_summary,'DRAFT',p_actor)
        RETURNING * INTO v_mission;
        INSERT INTO mission_events(id,mission_id,event_type,previous_state,next_state,actor,reason,idempotency_key)
        VALUES(p_event_id,p_mission_id,'CREATED',NULL,'DRAFT',p_actor,p_reason,p_idempotency_key);
        PERFORM atlas_append_audit(p_audit_id,'MISSION_CREATED','MISSION',p_mission_id::text,p_actor,'CREATE',
          jsonb_build_object('state','DRAFT','reason',p_reason,'idempotencyKey',p_idempotency_key));
        RETURN to_jsonb(v_mission) || jsonb_build_object('idempotent', false);
      END;
    $$ LANGUAGE plpgsql`,
    `CREATE OR REPLACE FUNCTION atlas_transition_mission(
      p_mission_id UUID, p_event_id UUID, p_audit_id UUID, p_next_state TEXT,
      p_actor TEXT, p_reason TEXT, p_idempotency_key TEXT
    ) RETURNS JSONB AS $$
      DECLARE v_mission missions; v_existing UUID; v_previous TEXT; v_allowed BOOLEAN;
      BEGIN
        SELECT mission_id INTO v_existing FROM mission_events WHERE idempotency_key = p_idempotency_key;
        IF v_existing IS NOT NULL THEN
          IF v_existing <> p_mission_id THEN RAISE EXCEPTION 'idempotency_conflict'; END IF;
          SELECT * INTO v_mission FROM missions WHERE id = v_existing;
          RETURN to_jsonb(v_mission) || jsonb_build_object('idempotent', true);
        END IF;
        SELECT * INTO v_mission FROM missions WHERE id = p_mission_id FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'mission_not_found'; END IF;
        v_previous := v_mission.state;
        v_allowed := CASE
          WHEN v_previous = 'DRAFT' THEN p_next_state IN ('REVIEW','ARCHIVED')
          WHEN v_previous = 'REVIEW' THEN p_next_state IN ('DRAFT','APPROVED','ARCHIVED')
          WHEN v_previous = 'APPROVED' THEN p_next_state IN ('ACTIVE','ARCHIVED')
          WHEN v_previous = 'ACTIVE' THEN p_next_state IN ('BLOCKED','COMPLETE','ARCHIVED')
          WHEN v_previous = 'BLOCKED' THEN p_next_state IN ('ACTIVE','COMPLETE','ARCHIVED')
          WHEN v_previous = 'COMPLETE' THEN p_next_state = 'ARCHIVED'
          ELSE false END;
        IF NOT v_allowed THEN RAISE EXCEPTION 'illegal_mission_transition'; END IF;
        UPDATE missions SET state=p_next_state,updated_at=clock_timestamp() WHERE id=p_mission_id RETURNING * INTO v_mission;
        INSERT INTO mission_events(id,mission_id,event_type,previous_state,next_state,actor,reason,idempotency_key)
        VALUES(p_event_id,p_mission_id,'STATE_CHANGED',v_previous,p_next_state,p_actor,p_reason,p_idempotency_key);
        PERFORM atlas_append_audit(p_audit_id,'MISSION_STATE_CHANGED','MISSION',p_mission_id::text,p_actor,'TRANSITION',
          jsonb_build_object('previousState',v_previous,'nextState',p_next_state,'reason',p_reason,'idempotencyKey',p_idempotency_key));
        RETURN to_jsonb(v_mission) || jsonb_build_object('previous_state',v_previous,'idempotent',false);
      END;
    $$ LANGUAGE plpgsql`
  ]
};
