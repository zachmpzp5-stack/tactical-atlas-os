export default {
  version: 5,
  name: 'governance_functions',
  statements: [
    `CREATE OR REPLACE FUNCTION atlas_accept_memory_candidate(
      p_candidate_id UUID, p_memory_id UUID, p_audit_id UUID, p_actor TEXT,
      p_idempotency_key TEXT, p_reason TEXT, p_supersedes UUID DEFAULT NULL
    ) RETURNS JSONB AS $$
      DECLARE v_candidate memory_candidates; v_memory tain_records; v_existing tain_records; v_version INTEGER := 1;
      BEGIN
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
    $$ LANGUAGE plpgsql`,
    `CREATE OR REPLACE FUNCTION atlas_decide_proposed_action(
      p_action_id UUID, p_approval_id UUID, p_audit_id UUID, p_decision TEXT,
      p_actor TEXT, p_reason TEXT, p_idempotency_key TEXT
    ) RETURNS JSONB AS $$
      DECLARE v_action proposed_actions; v_existing commander_approvals;
      BEGIN
        IF p_actor LIKE 'LYRA%' THEN RAISE EXCEPTION 'lyra_self_approval_denied'; END IF;
        SELECT * INTO v_existing FROM commander_approvals WHERE idempotency_key=p_idempotency_key;
        IF FOUND THEN SELECT * INTO v_action FROM proposed_actions WHERE id=v_existing.proposed_action_id;
          RETURN to_jsonb(v_action) || jsonb_build_object('idempotent',true); END IF;
        SELECT * INTO v_action FROM proposed_actions WHERE id=p_action_id FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'proposed_action_not_found'; END IF;
        IF v_action.status <> 'PENDING' THEN RAISE EXCEPTION 'proposed_action_already_decided'; END IF;
        INSERT INTO commander_approvals(id,proposed_action_id,decision,commander_actor,reason,idempotency_key)
        VALUES(p_approval_id,p_action_id,p_decision,p_actor,p_reason,p_idempotency_key);
        UPDATE proposed_actions SET status=p_decision,updated_at=clock_timestamp() WHERE id=p_action_id RETURNING * INTO v_action;
        PERFORM atlas_append_audit(p_audit_id,'PROPOSED_ACTION_DECIDED','PROPOSED_ACTION',p_action_id::text,p_actor,p_decision,
          jsonb_build_object('reason',p_reason,'idempotencyKey',p_idempotency_key));
        RETURN to_jsonb(v_action) || jsonb_build_object('idempotent',false);
      END;
    $$ LANGUAGE plpgsql`,
    `CREATE OR REPLACE FUNCTION atlas_verify_audit_integrity() RETURNS TABLE(valid BOOLEAN,failed_sequence BIGINT,reason TEXT) AS $$
      DECLARE v_event security_audit_events; v_previous TEXT := NULL; v_expected TEXT;
      BEGIN
        FOR v_event IN SELECT * FROM security_audit_events ORDER BY sequence LOOP
          IF coalesce(v_event.previous_hash,'') <> coalesce(v_previous,'') THEN
            RETURN QUERY SELECT false,v_event.sequence,'previous_hash_mismatch'::text; RETURN;
          END IF;
          v_expected := encode(digest(concat_ws('|',coalesce(v_previous,''),v_event.id::text,v_event.event_type,
            v_event.entity_type,coalesce(v_event.entity_id,''),v_event.actor,v_event.action,v_event.payload::text,
            to_char(v_event.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')),'sha256'),'hex');
          IF v_expected <> v_event.event_hash THEN
            RETURN QUERY SELECT false,v_event.sequence,'event_hash_mismatch'::text; RETURN;
          END IF;
          v_previous := v_event.event_hash;
        END LOOP;
        RETURN QUERY SELECT true,NULL::bigint,NULL::text;
      END;
    $$ LANGUAGE plpgsql STABLE`
  ]
};
