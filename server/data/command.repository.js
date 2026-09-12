import crypto from 'node:crypto';
import { query } from './database.js';
import { ensureMigrations } from './migrations/index.js';

function camelKey(key) {
  return key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
}

function mapValue(value) {
  if (Array.isArray(value)) return value.map(mapValue);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [camelKey(key), mapValue(entry)]));
  }
  return value;
}

async function ready() {
  const status = await ensureMigrations();
  if (status.status !== 'READY') throw new Error('database_not_configured');
}

async function rows(text, params = []) {
  await ready();
  return mapValue(await query(text, params));
}

function first(result) {
  return result[0] || null;
}

export const commandRepository = Object.freeze({
  async listMissions({ limit = 50 } = {}) {
    return rows(`SELECT m.*,
      (SELECT count(*)::int FROM objectives o WHERE o.mission_id=m.id) AS objective_count,
      (SELECT count(*)::int FROM evidence e WHERE e.mission_id=m.id) AS evidence_count
      FROM missions m ORDER BY m.updated_at DESC LIMIT $1`, [limit]);
  },

  async getMission(id) {
    return first(await rows('SELECT * FROM missions WHERE id=$1', [id]));
  },

  async getMissionDetail(id) {
    const mission = await this.getMission(id);
    if (!mission) return null;
    const [objectives, evidence, events] = await Promise.all([
      rows('SELECT * FROM objectives WHERE mission_id=$1 ORDER BY position,created_at', [id]),
      rows(`SELECT e.*,s.title AS source_title,s.locator,s.source_type,s.verification_status AS source_verification_status,s.retrieved_at
        FROM evidence e JOIN evidence_sources s ON s.id=e.source_id WHERE e.mission_id=$1 ORDER BY e.created_at DESC`, [id]),
      rows('SELECT * FROM mission_events WHERE mission_id=$1 ORDER BY created_at DESC', [id])
    ]);
    return { ...mission, objectives, evidence, events };
  },

  async findMissionByIdempotency(idempotencyKey) {
    return first(await rows(`SELECT m.* FROM mission_events e JOIN missions m ON m.id=e.mission_id WHERE e.idempotency_key=$1`, [idempotencyKey]));
  },

  async createMission({ id, eventId, auditId, title, summary, actor, reason, idempotencyKey }) {
    const result = first(await rows('SELECT atlas_create_mission($1,$2,$3,$4,$5,$6,$7,$8) AS result',
      [id,eventId,auditId,title,summary,actor,reason,idempotencyKey]));
    return result?.result || null;
  },

  async transitionMission({ missionId, eventId, auditId, nextState, actor, reason, idempotencyKey }) {
    const result = first(await rows('SELECT atlas_transition_mission($1,$2,$3,$4,$5,$6,$7) AS result',
      [missionId,eventId,auditId,nextState,actor,reason,idempotencyKey]));
    return result?.result || null;
  },

  async createObjective({ id, auditId, missionId, title, position, actor, idempotencyKey }) {
    return first(await rows(`WITH duplicate AS (
        SELECT o.* FROM security_audit_events a JOIN objectives o ON o.id=(a.payload->>'objectiveId')::uuid
        WHERE a.event_type='OBJECTIVE_CREATED' AND a.payload->>'idempotencyKey'=$6 LIMIT 1
      ), inserted AS (
        INSERT INTO objectives(id,mission_id,title,position)
        SELECT $1,$2,$3,$4 WHERE NOT EXISTS(SELECT 1 FROM duplicate) RETURNING *
      ), audited AS (
        SELECT atlas_append_audit($5,'OBJECTIVE_CREATED','MISSION',$2::text,$7,'CREATE_OBJECTIVE',
          jsonb_build_object('objectiveId',$1,'idempotencyKey',$6)) FROM inserted
      ) SELECT inserted.* FROM inserted CROSS JOIN audited UNION ALL SELECT * FROM duplicate LIMIT 1`,
      [id,missionId,title,position,auditId,idempotencyKey,actor]));
  },

  async createEvidence({ evidenceId, sourceId, auditId, missionId, sourceType, sourceTitle, locator, sourceTimestamp, verificationStatus, title, excerpt, classification, confidence, actor, idempotencyKey }) {
    return first(await rows(`WITH duplicate AS (
        SELECT e.* FROM security_audit_events a JOIN evidence e ON e.id=(a.payload->>'evidenceId')::uuid
        WHERE a.event_type='EVIDENCE_CREATED' AND a.payload->>'idempotencyKey'=$15 LIMIT 1
      ), source AS (
        INSERT INTO evidence_sources(id,source_type,title,locator,retrieved_at,verification_status)
        SELECT $2,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT 1 FROM duplicate)
        ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title RETURNING *
      ), inserted AS (
        INSERT INTO evidence(id,mission_id,source_id,title,excerpt,classification,confidence)
        SELECT $1,$4,$2,$10,$11,$12,$13 WHERE EXISTS(SELECT 1 FROM source) RETURNING *
      ), audited AS (
        SELECT atlas_append_audit($3,'EVIDENCE_CREATED','MISSION',$4::text,$14,'CREATE_EVIDENCE',
          jsonb_build_object('evidenceId',$1,'sourceId',$2,'idempotencyKey',$15)) FROM inserted
      ) SELECT inserted.* FROM inserted CROSS JOIN audited UNION ALL SELECT * FROM duplicate LIMIT 1`,
      [evidenceId,sourceId,auditId,missionId,sourceType,sourceTitle,locator,sourceTimestamp,verificationStatus,title,excerpt,classification,confidence,actor,idempotencyKey]));
  },

  async searchMemories({ query: search, missionId = null, includeGlobal = true, limit = 10 }) {
    return rows(`SELECT id,title,content,source,mission_id,verification_status,confidence,classification,retention_setting,
      memory_type,provenance,source_timestamp,captured_at,sensitivity,expires_at,review_at,version,subject_key,
      authority_status,supersedes_memory_id,superseded_by_memory_id,trust_boundary,created_at,
      ts_rank(search_document,websearch_to_tsquery('english',$1)) AS rank
      FROM tain_records
      WHERE authority_status='AUTHORITATIVE'
        AND search_document @@ websearch_to_tsquery('english',$1)
        AND (($2::uuid IS NULL AND mission_id IS NULL) OR ($2::uuid IS NOT NULL AND (mission_id=$2 OR ($3 AND mission_id IS NULL))))
      ORDER BY rank DESC,captured_at DESC LIMIT $4`, [search,missionId,includeGlobal,limit]);
  },

  async listMemoryCandidates({ status = null, missionId = null, limit = 50 } = {}) {
    return rows(`SELECT * FROM memory_candidates WHERE ($1::text IS NULL OR status=$1)
      AND ($2::uuid IS NULL OR mission_id=$2) ORDER BY created_at DESC LIMIT $3`, [status,missionId,limit]);
  },

  async getMemoryCandidate(id) {
    return first(await rows('SELECT * FROM memory_candidates WHERE id=$1', [id]));
  },

  async findMemoryCandidateByIdempotency(idempotencyKey) {
    return first(await rows('SELECT * FROM memory_candidates WHERE idempotency_key=$1', [idempotencyKey]));
  },

  async findAuthoritativeBySubject({ subjectKey, missionId }) {
    return rows(`SELECT * FROM tain_records WHERE subject_key=$1 AND authority_status='AUTHORITATIVE'
      AND (($2::uuid IS NULL AND mission_id IS NULL) OR mission_id=$2) ORDER BY version DESC,captured_at DESC`, [subjectKey,missionId]);
  },

  async createMemoryCandidate(candidate) {
    return first(await rows(`WITH inserted AS (
      INSERT INTO memory_candidates(id,memory_type,subject_key,title,content,normalized_hash,source,provenance,source_timestamp,
        verification_status,confidence,sensitivity,retention_policy,expires_at,review_at,mission_id,proposed_by,
        source_record_retained,trust_boundary,status,idempotency_key)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'UNTRUSTED_DATA',$19,$20)
      ON CONFLICT(idempotency_key) DO NOTHING RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($21,'MEMORY_CANDIDATE_CREATED','MEMORY_CANDIDATE',id::text,$22,'CREATE_CANDIDATE',
        jsonb_build_object('memoryType',$2,'subjectKey',$3,'status',$19,'idempotencyKey',$20)) FROM inserted
    ) SELECT inserted.* FROM inserted CROSS JOIN audited
      UNION ALL SELECT * FROM memory_candidates WHERE idempotency_key=$20 LIMIT 1`, [
      candidate.id,candidate.memoryType,candidate.subjectKey,candidate.title,candidate.content,candidate.normalizedHash,
      candidate.source,JSON.stringify(candidate.provenance),candidate.sourceTimestamp,candidate.verificationStatus,candidate.confidence,
      candidate.sensitivity,candidate.retentionPolicy,candidate.expiresAt,candidate.reviewAt,candidate.missionId,candidate.proposedBy,
      candidate.sourceRecordRetained,candidate.status,candidate.idempotencyKey,candidate.auditId,candidate.proposedBy
    ]));
  },

  async createMemoryConflict({ id, candidateId, existingMemoryId, conflictType, auditId, actor }) {
    return first(await rows(`WITH inserted AS (
      INSERT INTO memory_conflicts(id,candidate_id,existing_memory_id,conflict_type)
      VALUES($1,$2,$3,$4) ON CONFLICT(candidate_id,existing_memory_id) DO NOTHING RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($5,'MEMORY_CONFLICT_DETECTED','MEMORY_CANDIDATE',$2::text,$6,'FLAG_CONFLICT',
        jsonb_build_object('conflictId',$1,'existingMemoryId',$3,'conflictType',$4)) FROM inserted
    ) SELECT inserted.* FROM inserted CROSS JOIN audited
      UNION ALL SELECT * FROM memory_conflicts WHERE candidate_id=$2 AND existing_memory_id=$3 LIMIT 1`,
      [id,candidateId,existingMemoryId,conflictType,auditId,actor]));
  },

  async markCandidateConflict(candidateId) {
    return first(await rows(`UPDATE memory_candidates SET status='CONFLICT',updated_at=clock_timestamp() WHERE id=$1 RETURNING *`, [candidateId]));
  },

  async listMemoryConflicts({ status = 'OPEN', missionId = null } = {}) {
    return rows(`SELECT c.*,mc.title AS candidate_title,mc.content AS candidate_content,mc.mission_id,
      tr.title AS existing_title,tr.content AS existing_content,tr.version AS existing_version
      FROM memory_conflicts c JOIN memory_candidates mc ON mc.id=c.candidate_id JOIN tain_records tr ON tr.id=c.existing_memory_id
      WHERE ($1::text IS NULL OR c.status=$1) AND ($2::uuid IS NULL OR mc.mission_id=$2) ORDER BY c.created_at DESC`, [status,missionId]);
  },

  async acceptMemoryCandidate({ candidateId, memoryId, auditId, actor, idempotencyKey, reason, supersedesMemoryId = null }) {
    const result = first(await rows('SELECT atlas_accept_memory_candidate($1,$2,$3,$4,$5,$6,$7) AS result',
      [candidateId,memoryId,auditId,actor,idempotencyKey,reason,supersedesMemoryId]));
    return result?.result || null;
  },

  async rejectMemoryCandidate({ candidateId, auditId, actor, reason, idempotencyKey }) {
    return first(await rows(`WITH duplicate AS (
      SELECT mc.* FROM security_audit_events a JOIN memory_candidates mc ON mc.id=a.entity_id::uuid
      WHERE a.event_type='MEMORY_CANDIDATE_REJECTED' AND a.payload->>'idempotencyKey'=$5 LIMIT 1
    ), updated AS (
      UPDATE memory_candidates SET status='REJECTED',updated_at=clock_timestamp()
      WHERE id=$1 AND status IN ('PENDING_REVIEW','CONFLICT') AND NOT EXISTS(SELECT 1 FROM duplicate) RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($2,'MEMORY_CANDIDATE_REJECTED','MEMORY_CANDIDATE',$1::text,$3,'REJECT',
        jsonb_build_object('reason',$4,'idempotencyKey',$5)) FROM updated
    ) SELECT updated.* FROM updated CROSS JOIN audited UNION ALL SELECT * FROM duplicate LIMIT 1`, [candidateId,auditId,actor,reason,idempotencyKey]));
  },

  async archiveMemory({ memoryId, auditId, actor, reason, idempotencyKey }) {
    return first(await rows(`WITH duplicate AS (
      SELECT tr.* FROM security_audit_events a JOIN tain_records tr ON tr.id=a.entity_id::uuid
      WHERE a.event_type='MEMORY_ARCHIVED' AND a.payload->>'idempotencyKey'=$5 LIMIT 1
    ), updated AS (
      UPDATE tain_records SET authority_status='ARCHIVED' WHERE id=$1 AND authority_status='AUTHORITATIVE'
        AND NOT EXISTS(SELECT 1 FROM duplicate) RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($2,'MEMORY_ARCHIVED','TAIN_MEMORY',$1::text,$3,'ARCHIVE',
        jsonb_build_object('reason',$4,'idempotencyKey',$5)) FROM updated
    ) SELECT updated.* FROM updated CROSS JOIN audited UNION ALL SELECT * FROM duplicate LIMIT 1`, [memoryId,auditId,actor,reason,idempotencyKey]));
  },

  async deleteMemory({ memoryId, auditId, actor, reason, idempotencyKey }) {
    return first(await rows(`WITH duplicate AS (
      SELECT (a.entity_id)::uuid AS id,a.payload->>'title' AS title,(a.payload->>'version')::int AS version
      FROM security_audit_events a WHERE a.event_type='MEMORY_DELETED' AND a.payload->>'idempotencyKey'=$5 LIMIT 1
    ), target AS (
      SELECT * FROM tain_records WHERE id=$1 AND retention_setting <> 'PERMANENT'
        AND NOT EXISTS(SELECT 1 FROM duplicate) FOR UPDATE
    ), audited AS (
      SELECT atlas_append_audit($2,'MEMORY_DELETED','TAIN_MEMORY',$1::text,$3,'DELETE',
        jsonb_build_object('reason',$4,'idempotencyKey',$5,'title',title,'version',version)) FROM target
    ), removed AS (
      DELETE FROM tain_records WHERE id IN (SELECT target.id FROM target CROSS JOIN audited) RETURNING id,title,version
    ) SELECT * FROM removed UNION ALL SELECT * FROM duplicate LIMIT 1`, [memoryId,auditId,actor,reason,idempotencyKey]));
  },

  async listProposedActions({ status = null, limit = 50 } = {}) {
    return rows('SELECT * FROM proposed_actions WHERE ($1::text IS NULL OR status=$1) ORDER BY created_at DESC LIMIT $2', [status,limit]);
  },

  async createProposedAction({ id, auditId, missionId, title, description, proposedBy, idempotencyKey }) {
    return first(await rows(`WITH inserted AS (
      INSERT INTO proposed_actions(id,mission_id,title,description,proposed_by,idempotency_key)
      VALUES($1,$3,$4,$5,$6,$7) ON CONFLICT(idempotency_key) DO NOTHING RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($2,'ACTION_PROPOSED','PROPOSED_ACTION',id::text,$6,'PROPOSE',
        jsonb_build_object('missionId',$3,'idempotencyKey',$7)) FROM inserted
    ) SELECT inserted.* FROM inserted CROSS JOIN audited
      UNION ALL SELECT * FROM proposed_actions WHERE idempotency_key=$7 LIMIT 1`,
      [id,auditId,missionId,title,description,proposedBy,idempotencyKey]));
  },

  async decideProposedAction({ actionId, approvalId, auditId, decision, actor, reason, idempotencyKey }) {
    const result = first(await rows('SELECT atlas_decide_proposed_action($1,$2,$3,$4,$5,$6,$7) AS result',
      [actionId,approvalId,auditId,decision,actor,reason,idempotencyKey]));
    return result?.result || null;
  },

  async saveLyraExchange({ conversationId, userMessageId, replyMessageId, bindingHash, clearance, message, reply, classification, evidenceReferences }) {
    const saved = await rows(`WITH conversation AS (
      INSERT INTO lyra_conversations(id,commander_binding_hash,clearance) VALUES($1,$4,$5)
      ON CONFLICT(id) DO UPDATE SET clearance=EXCLUDED.clearance,updated_at=clock_timestamp()
        WHERE lyra_conversations.commander_binding_hash=EXCLUDED.commander_binding_hash
      RETURNING id
    ), user_message AS (
      INSERT INTO lyra_messages(id,conversation_id,role,content) SELECT $2,id,'USER',$6 FROM conversation ON CONFLICT(id) DO NOTHING
    ) INSERT INTO lyra_messages(id,conversation_id,role,content,fact_classification,evidence_references)
      SELECT $3,id,'LYRA',$7,$8::jsonb,$9::jsonb FROM conversation ON CONFLICT(id) DO NOTHING
      RETURNING conversation_id`,
      [conversationId,userMessageId,replyMessageId,bindingHash,clearance,message,reply,JSON.stringify(classification),JSON.stringify(evidenceReferences)]);
    if (!saved.length) throw new Error('conversation_binding_mismatch');
  },

  async createSyncRun({ id, provider, idempotencyKey }) {
    return first(await rows(`INSERT INTO integration_sync_runs(id,provider,status,current_step,idempotency_key)
      VALUES($1,$2,'PENDING','AUTHORIZE',$3) ON CONFLICT(idempotency_key) DO UPDATE SET updated_at=integration_sync_runs.updated_at RETURNING *`,
      [id,provider,idempotencyKey]));
  },

  async updateSyncRun(id, fields) {
    const auditId = fields.auditId || crypto.randomUUID();
    const actor = fields.actor || 'SYSTEM_INTEGRATION';
    const auditKey = fields.auditKey || `${id}:${fields.status}:${fields.attemptCount}`;
    return first(await rows(`WITH updated AS (
      UPDATE integration_sync_runs SET status=$2,current_step=$3,completed_steps=$4::jsonb,
      attempt_count=$5,last_error_code=$6,next_retry_at=$7,updated_at=clock_timestamp(),
      completed_at=CASE WHEN $2 IN ('SUCCEEDED','DISCONNECTED','NOT_CONFIGURED','REAUTHORIZATION_REQUIRED') THEN clock_timestamp() ELSE NULL END
      WHERE id=$1 RETURNING *
    ), audited AS (
      SELECT atlas_append_audit($8,'INTEGRATION_SYNC_STATE','INTEGRATION_SYNC_RUN',$1::text,$9,'SYNC_STATE',
        jsonb_build_object('status',$2,'step',$3,'attemptCount',$5,'idempotencyKey',$10)) FROM updated
      WHERE $2 IN ('SUCCEEDED','FAILED','DISCONNECTED','NOT_CONFIGURED','REAUTHORIZATION_REQUIRED')
    ) SELECT updated.* FROM updated LEFT JOIN audited ON true`,
      [id,fields.status,fields.currentStep,JSON.stringify(fields.completedSteps || []),fields.attemptCount,fields.lastErrorCode || null,fields.nextRetryAt || null,auditId,actor,auditKey]));
  },

  async upsertIntegrationRecord({ id, provider, externalId, recordType, normalizedData, retrievedAt, sourceEndpoint, syncStatus, syncRunId }) {
    return first(await rows(`INSERT INTO integration_records(id,provider,external_id,record_type,normalized_data,retrieved_at,source_endpoint,sync_status,sync_run_id)
      VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)
      ON CONFLICT(provider,external_id,record_type) DO UPDATE SET normalized_data=EXCLUDED.normalized_data,retrieved_at=EXCLUDED.retrieved_at,
        source_endpoint=EXCLUDED.source_endpoint,sync_status=EXCLUDED.sync_status,sync_run_id=EXCLUDED.sync_run_id,updated_at=clock_timestamp()
      RETURNING *`, [id,provider,externalId,recordType,JSON.stringify(normalizedData),retrievedAt,sourceEndpoint,syncStatus,syncRunId]));
  },

  async listSyncRuns({ provider = null, limit = 25 } = {}) {
    return rows('SELECT * FROM integration_sync_runs WHERE ($1::text IS NULL OR provider=$1) ORDER BY started_at DESC LIMIT $2', [provider,limit]);
  },

  async listIntegrationRecords({ provider = null, limit = 25 } = {}) {
    return rows('SELECT * FROM integration_records WHERE ($1::text IS NULL OR provider=$1) ORDER BY retrieved_at DESC LIMIT $2', [provider,limit]);
  },

  async deleteIntegrationData({ provider, auditId, actor, idempotencyKey }) {
    const deleted = await rows(`WITH duplicate AS (
      SELECT (payload->>'recordCount')::int AS deleted_count FROM security_audit_events
      WHERE event_type='INTEGRATION_DATA_DELETED' AND payload->>'idempotencyKey'=$4 LIMIT 1
    ), removed AS (
      DELETE FROM integration_records WHERE provider=$1 AND NOT EXISTS(SELECT 1 FROM duplicate) RETURNING id
    ), audited AS (
      SELECT atlas_append_audit($2,'INTEGRATION_DATA_DELETED','INTEGRATION',$1,$3,'DELETE_PROVIDER_DATA',
        jsonb_build_object('idempotencyKey',$4,'recordCount',(SELECT count(*) FROM removed)))
      WHERE NOT EXISTS(SELECT 1 FROM duplicate)
    ) SELECT count(*)::int AS deleted_count FROM removed CROSS JOIN audited
      UNION ALL SELECT deleted_count FROM duplicate LIMIT 1`, [provider,auditId,actor,idempotencyKey]);
    return first(deleted) || { deletedCount: 0 };
  },

  async getAuditEvents({ limit = 1000 } = {}) {
    return rows(`SELECT id,event_type,entity_type,entity_id,actor,action,payload,previous_hash,event_hash,created_at
      FROM security_audit_events ORDER BY sequence ASC LIMIT $1`, [limit]);
  },

  async verifyAuditIntegrity() {
    return first(await rows('SELECT * FROM atlas_verify_audit_integrity()'));
  },

  newId() { return crypto.randomUUID(); }
});
