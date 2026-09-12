export default {
  version: 6,
  name: 'concurrency_idempotency',
  statements: [
    `CREATE OR REPLACE FUNCTION atlas_create_mission(
      p_mission_id UUID, p_event_id UUID, p_audit_id UUID, p_title TEXT, p_summary TEXT,
      p_actor TEXT, p_reason TEXT, p_idempotency_key TEXT
    ) RETURNS JSONB AS $$
      DECLARE v_mission missions; v_existing UUID;
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtext('mission_create:' || p_idempotency_key));
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
        PERFORM pg_advisory_xact_lock(hashtext('mission_transition:' || p_idempotency_key));
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
    $$ LANGUAGE plpgsql`,
    `CREATE OR REPLACE FUNCTION atlas_accept_memory_candidate(
      p_candidate_id UUID, p_memory_id UUID, p_audit_id UUID, p_actor TEXT,
      p_idempotency_key TEXT, p_reason TEXT, p_supersedes UUID DEFAULT NULL
    ) RETURNS JSONB AS $$
      DECLARE v_candidate memory_candidates; v_memory tain_records; v_existing tain_records; v_version INTEGER := 1;
      BEGIN
        PERFORM pg_advisory_xact_lock(hashtext('memory_accept:' || p_idempotency_key));
        SELECT * INTO v_existing FROM tain_records WHERE provenance->>'acceptIdempotencyKey' = p_idempotency_key LIMIT 1;
        IF FOUND THEN RETURN to_jsonb(v_existing) || jsonb_build_object('idempotent',true); END IF;
        SELECT * INTO v_candidate FROM memory_candidates WHERE id=p_candidate_id FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'memory_candidate_not_found'; END IF;
        IF v_candidate.status NOT IN ('PENDING_REVIEW','CONFLICT') THEN RAISE EXCEPTION 'memory_candidate_not_reviewable'; END IF;
        IF p_supersedes IS NOT NULL THEN
          SELECT coalesce(version,0)+1 INTO v_version FROM tain_records WHERE id=p_supersedes AND authority_status='AUTHORITATIVE' FOR UPDATE;
          IF NOT FOUND THEN RAISE EXCEPTION 'memory_to_supersede_not_found'; END IF;
        END IF;
        INSERT INTO tain_records(id,title,content,source,mission_id,verification_status,confidence,classification,retention_setting,
          memory_type,provenance,source_timestamp,captured_at,sensitivity,expires_at,review_at,version,subject_key,authority_status,
          supersedes_memory_id,trust_boundary)
        VALUES(p_memory_id,v_candidate.title,v_candidate.content,v_candidate.source,v_candidate.mission_id,v_candidate.verification_status,
          v_candidate.confidence,v_candidate.sensitivity,v_candidate.retention_policy,v_candidate.memory_type,
          v_candidate.provenance || jsonb_build_object('candidateId',v_candidate.id,'acceptIdempotencyKey',p_idempotency_key),
          v_candidate.source_timestamp,v_candidate.captured_at,v_candidate.sensitivity,v_candidate.expires_at,v_candidate.review_at,
          v_version,v_candidate.subject_key,'AUTHORITATIVE',p_supersedes,v_candidate.trust_boundary)
        RETURNING * INTO v_memory;
        IF p_supersedes IS NOT NULL THEN
          UPDATE tain_records SET authority_status='SUPERSEDED',superseded_by_memory_id=p_memory_id WHERE id=p_supersedes;
        END IF;
        UPDATE memory_candidates SET status=CASE WHEN p_actor='SYSTEM_AUTHORIZED_API' THEN 'AUTO_ACCEPTED' ELSE 'ACCEPTED' END,
          updated_at=clock_timestamp() WHERE id=p_candidate_id;
        UPDATE memory_conflicts SET status='RESOLVED',resolution='SUPERSEDED_BY_ACCEPTED_MEMORY',resolved_at=clock_timestamp()
          WHERE candidate_id=p_candidate_id AND p_supersedes IS NOT NULL;
        PERFORM atlas_append_audit(p_audit_id,'MEMORY_ACCEPTED','TAIN_MEMORY',p_memory_id::text,p_actor,'ACCEPT',
          jsonb_build_object('candidateId',p_candidate_id,'supersedes',p_supersedes,'version',v_version,'reason',p_reason,'idempotencyKey',p_idempotency_key));
        RETURN to_jsonb(v_memory) || jsonb_build_object('idempotent',false);
      END;
    $$ LANGUAGE plpgsql`
  ]
};
