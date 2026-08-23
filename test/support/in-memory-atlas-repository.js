import crypto from 'node:crypto';
import { computeAuditHash } from '../../server/security/audit.js';

export class InMemoryAtlasRepository {
  constructor() {
    this.missions = new Map();
    this.events = new Map();
    this.objectives = new Map();
    this.evidence = new Map();
    this.audit = [];
    this.candidates = new Map();
    this.candidateIdempotency = new Map();
    this.memories = new Map();
    this.conflicts = [];
    this.proposals = new Map();
    this.approvals = new Map();
    this.syncRuns = new Map();
    this.integrationRecords = [];
  }
  appendAudit({
    id = crypto.randomUUID(),
    eventType,
    entityType,
    entityId,
    actor,
    action,
    payload,
  }) {
    const createdAt = new Date(1_700_000_000_000 + this.audit.length).toISOString();
    const previousHash = this.audit.at(-1)?.eventHash || '';
    const event = {
      id,
      eventType,
      entityType,
      entityId,
      actor,
      action,
      payload,
      createdAt,
      previousHash,
    };
    event.eventHash = computeAuditHash(event, previousHash);
    this.audit.push(event);
    return event;
  }
  async listMissions() {
    return [...this.missions.values()].map((item) => ({ ...item }));
  }
  async getMission(id) {
    return this.missions.get(id) ? { ...this.missions.get(id) } : null;
  }
  async getMissionDetail(id) {
    const mission = await this.getMission(id);
    return mission
      ? {
          ...mission,
          objectives: [...this.objectives.values()].filter((item) => item.missionId === id),
          evidence: [...this.evidence.values()].filter((item) => item.missionId === id),
          events: [...this.events.values()].filter((event) => event.missionId === id),
        }
      : null;
  }
  async findMissionByIdempotency(key) {
    const event = this.events.get(key);
    return event ? this.getMission(event.missionId) : null;
  }
  async createMission(input) {
    const duplicate = await this.findMissionByIdempotency(input.idempotencyKey);
    if (duplicate) return { ...duplicate, idempotent: true };
    const mission = {
      id: input.id,
      title: input.title,
      summary: input.summary,
      state: 'DRAFT',
      createdBy: input.actor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.missions.set(mission.id, mission);
    this.events.set(input.idempotencyKey, {
      id: input.eventId,
      missionId: mission.id,
      previousState: null,
      nextState: 'DRAFT',
      actor: input.actor,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
    });
    this.appendAudit({
      id: input.auditId,
      eventType: 'MISSION_CREATED',
      entityType: 'MISSION',
      entityId: mission.id,
      actor: input.actor,
      action: 'CREATE',
      payload: { state: 'DRAFT', reason: input.reason, idempotencyKey: input.idempotencyKey },
    });
    return { ...mission, idempotent: false };
  }
  async transitionMission(input) {
    const mission = this.missions.get(input.missionId);
    const previousState = mission.state;
    mission.state = input.nextState;
    mission.updatedAt = new Date().toISOString();
    this.events.set(input.idempotencyKey, {
      id: input.eventId,
      missionId: mission.id,
      previousState,
      nextState: input.nextState,
      actor: input.actor,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
    });
    this.appendAudit({
      id: input.auditId,
      eventType: 'MISSION_STATE_CHANGED',
      entityType: 'MISSION',
      entityId: mission.id,
      actor: input.actor,
      action: 'TRANSITION',
      payload: {
        previousState,
        nextState: input.nextState,
        reason: input.reason,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return { ...mission, previousState, idempotent: false };
  }
  async createObjective(input) {
    const duplicate = this.audit.find(
      (event) =>
        event.eventType === 'OBJECTIVE_CREATED' &&
        event.payload.idempotencyKey === input.idempotencyKey
    );
    if (duplicate)
      return { ...this.objectives.get(duplicate.payload.objectiveId), idempotent: true };
    const objective = {
      id: input.id,
      missionId: input.missionId,
      title: input.title,
      position: input.position,
      createdAt: new Date().toISOString(),
    };
    this.objectives.set(objective.id, objective);
    this.appendAudit({
      id: input.auditId,
      eventType: 'OBJECTIVE_CREATED',
      entityType: 'MISSION',
      entityId: input.missionId,
      actor: input.actor,
      action: 'CREATE_OBJECTIVE',
      payload: { objectiveId: objective.id, idempotencyKey: input.idempotencyKey },
    });
    return { ...objective, idempotent: false };
  }
  async createEvidence(input) {
    const duplicate = this.audit.find(
      (event) =>
        event.eventType === 'EVIDENCE_CREATED' &&
        event.payload.idempotencyKey === input.idempotencyKey
    );
    if (duplicate) return { ...this.evidence.get(duplicate.payload.evidenceId), idempotent: true };
    const row = {
      id: input.evidenceId,
      missionId: input.missionId,
      title: input.title,
      excerpt: input.excerpt,
      sourceTitle: input.sourceTitle,
      locator: input.locator,
      sourceType: input.sourceType,
      sourceVerificationStatus: input.verificationStatus,
      classification: input.classification,
      confidence: input.confidence,
      createdAt: new Date().toISOString(),
    };
    this.evidence.set(row.id, row);
    this.appendAudit({
      id: input.auditId,
      eventType: 'EVIDENCE_CREATED',
      entityType: 'MISSION',
      entityId: input.missionId,
      actor: input.actor,
      action: 'CREATE_EVIDENCE',
      payload: {
        evidenceId: row.id,
        sourceId: input.sourceId,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return { ...row, idempotent: false };
  }
  async findMemoryCandidateByIdempotency(key) {
    const id = this.candidateIdempotency.get(key);
    return id ? { ...this.candidates.get(id) } : null;
  }
  async findAuthoritativeBySubject({ subjectKey, missionId }) {
    return [...this.memories.values()]
      .filter(
        (memory) =>
          memory.subjectKey === subjectKey &&
          (memory.missionId || null) === (missionId || null) &&
          memory.authorityStatus === 'AUTHORITATIVE'
      )
      .map((item) => ({ ...item }));
  }
  async createMemoryCandidate(candidate) {
    this.candidates.set(candidate.id, {
      ...candidate,
      capturedAt: new Date().toISOString(),
      trustBoundary: 'UNTRUSTED_DATA',
    });
    this.candidateIdempotency.set(candidate.idempotencyKey, candidate.id);
    this.appendAudit({
      id: candidate.auditId,
      eventType: 'MEMORY_CANDIDATE_CREATED',
      entityType: 'MEMORY_CANDIDATE',
      entityId: candidate.id,
      actor: candidate.proposedBy,
      action: 'CREATE_CANDIDATE',
      payload: {
        memoryType: candidate.memoryType,
        subjectKey: candidate.subjectKey,
        status: candidate.status,
        idempotencyKey: candidate.idempotencyKey,
      },
    });
    return { ...this.candidates.get(candidate.id) };
  }
  async createMemoryConflict(conflict) {
    const row = { ...conflict, status: 'OPEN', createdAt: new Date().toISOString() };
    this.conflicts.push(row);
    this.appendAudit({
      id: conflict.auditId,
      eventType: 'MEMORY_CONFLICT_DETECTED',
      entityType: 'MEMORY_CANDIDATE',
      entityId: conflict.candidateId,
      actor: conflict.actor,
      action: 'FLAG_CONFLICT',
      payload: {
        conflictId: conflict.id,
        existingMemoryId: conflict.existingMemoryId,
        conflictType: conflict.conflictType,
      },
    });
    return { ...row };
  }
  async markCandidateConflict(id) {
    const candidate = this.candidates.get(id);
    candidate.status = 'CONFLICT';
    return { ...candidate };
  }
  async getMemoryCandidate(id) {
    return this.candidates.get(id) ? { ...this.candidates.get(id) } : null;
  }
  async listMemoryCandidates({ status = null, missionId = null } = {}) {
    return [...this.candidates.values()]
      .filter(
        (item) =>
          (!status || item.status === status) && (!missionId || item.missionId === missionId)
      )
      .map((item) => ({ ...item }));
  }
  async listMemoryConflicts({ status = 'OPEN', missionId = null } = {}) {
    return this.conflicts
      .filter(
        (item) =>
          (!status || item.status === status) &&
          (!missionId || this.candidates.get(item.candidateId)?.missionId === missionId)
      )
      .map((item) => ({ ...item }));
  }
  async acceptMemoryCandidate({
    candidateId,
    memoryId,
    auditId,
    actor,
    idempotencyKey,
    reason,
    supersedesMemoryId = null,
  }) {
    const existing = [...this.memories.values()].find(
      (item) => item.provenance?.acceptIdempotencyKey === idempotencyKey
    );
    if (existing) return { ...existing, idempotent: true };
    const candidate = this.candidates.get(candidateId);
    if (!candidate) throw new Error('memory_candidate_not_found');
    if (!['PENDING_REVIEW', 'CONFLICT'].includes(candidate.status))
      throw new Error('memory_candidate_not_reviewable');
    let version = 1;
    if (supersedesMemoryId) {
      const prior = this.memories.get(supersedesMemoryId);
      if (!prior) throw new Error('memory_to_supersede_not_found');
      version = prior.version + 1;
      prior.authorityStatus = 'SUPERSEDED';
      prior.supersededByMemoryId = memoryId;
    }
    const memory = {
      id: memoryId,
      title: candidate.title,
      content: candidate.content,
      source: candidate.source,
      missionId: candidate.missionId || null,
      verificationStatus: candidate.verificationStatus,
      confidence: candidate.confidence,
      sensitivity: candidate.sensitivity,
      classification: candidate.sensitivity,
      retentionSetting: candidate.retentionPolicy,
      memoryType: candidate.memoryType,
      provenance: { ...candidate.provenance, candidateId, acceptIdempotencyKey: idempotencyKey },
      sourceTimestamp: candidate.sourceTimestamp,
      capturedAt: candidate.capturedAt,
      expiresAt: candidate.expiresAt,
      reviewAt: candidate.reviewAt,
      version,
      subjectKey: candidate.subjectKey,
      authorityStatus: 'AUTHORITATIVE',
      supersedesMemoryId,
      trustBoundary: 'UNTRUSTED_DATA',
    };
    this.memories.set(memoryId, memory);
    candidate.status = actor === 'SYSTEM_AUTHORIZED_API' ? 'AUTO_ACCEPTED' : 'ACCEPTED';
    this.conflicts
      .filter((item) => item.candidateId === candidateId)
      .forEach((item) => {
        item.status = 'RESOLVED';
      });
    this.appendAudit({
      id: auditId,
      eventType: 'MEMORY_ACCEPTED',
      entityType: 'TAIN_MEMORY',
      entityId: memoryId,
      actor,
      action: 'ACCEPT',
      payload: { candidateId, supersedesMemoryId, version, reason, idempotencyKey },
    });
    return { ...memory, idempotent: false };
  }
  async rejectMemoryCandidate({ candidateId, auditId, actor, reason, idempotencyKey }) {
    const duplicate = this.audit.find(
      (event) =>
        event.eventType === 'MEMORY_CANDIDATE_REJECTED' &&
        event.payload.idempotencyKey === idempotencyKey
    );
    if (duplicate) return { ...this.candidates.get(duplicate.entityId), idempotent: true };
    const candidate = this.candidates.get(candidateId);
    if (!candidate || !['PENDING_REVIEW', 'CONFLICT'].includes(candidate.status)) return null;
    candidate.status = 'REJECTED';
    this.appendAudit({
      id: auditId,
      eventType: 'MEMORY_CANDIDATE_REJECTED',
      entityType: 'MEMORY_CANDIDATE',
      entityId: candidateId,
      actor,
      action: 'REJECT',
      payload: { reason, idempotencyKey },
    });
    return { ...candidate };
  }
  async archiveMemory({ memoryId, auditId, actor, reason, idempotencyKey }) {
    const duplicate = this.audit.find(
      (event) =>
        event.eventType === 'MEMORY_ARCHIVED' && event.payload.idempotencyKey === idempotencyKey
    );
    if (duplicate) return { ...this.memories.get(duplicate.entityId), idempotent: true };
    const memory = this.memories.get(memoryId);
    if (!memory || memory.authorityStatus !== 'AUTHORITATIVE') return null;
    memory.authorityStatus = 'ARCHIVED';
    this.appendAudit({
      id: auditId,
      eventType: 'MEMORY_ARCHIVED',
      entityType: 'TAIN_MEMORY',
      entityId: memoryId,
      actor,
      action: 'ARCHIVE',
      payload: { reason, idempotencyKey },
    });
    return { ...memory };
  }
  async deleteMemory({ memoryId, auditId, actor, reason, idempotencyKey }) {
    const duplicate = this.audit.find(
      (event) =>
        event.eventType === 'MEMORY_DELETED' && event.payload.idempotencyKey === idempotencyKey
    );
    if (duplicate) return { id: duplicate.entityId, idempotent: true };
    const memory = this.memories.get(memoryId);
    if (!memory || memory.retentionSetting === 'PERMANENT') return null;
    this.memories.delete(memoryId);
    this.appendAudit({
      id: auditId,
      eventType: 'MEMORY_DELETED',
      entityType: 'TAIN_MEMORY',
      entityId: memoryId,
      actor,
      action: 'DELETE',
      payload: { reason, idempotencyKey },
    });
    return { id: memoryId };
  }
  async searchMemories({ query, missionId = null, includeGlobal = true, limit = 10 }) {
    const needle = query.toLowerCase();
    return [...this.memories.values()]
      .filter(
        (memory) =>
          memory.authorityStatus === 'AUTHORITATIVE' &&
          (memory.title + ' ' + memory.content).toLowerCase().includes(needle) &&
          ((missionId && memory.missionId === missionId) ||
            (missionId && includeGlobal && !memory.missionId) ||
            (!missionId && !memory.missionId))
      )
      .slice(0, limit)
      .map((item) => ({ ...item }));
  }
  async createProposedAction(input) {
    const duplicate = [...this.proposals.values()].find(
      (item) => item.idempotencyKey === input.idempotencyKey
    );
    if (duplicate) return { ...duplicate };
    const row = {
      id: input.id,
      missionId: input.missionId,
      title: input.title,
      description: input.description,
      proposedBy: input.proposedBy,
      status: 'PENDING',
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date().toISOString(),
    };
    this.proposals.set(row.id, row);
    return { ...row };
  }
  async listProposedActions({ status = null } = {}) {
    return [...this.proposals.values()]
      .filter((item) => !status || item.status === status)
      .map((item) => ({ ...item }));
  }
  async decideProposedAction(input) {
    if (String(input.actor).startsWith('LYRA')) throw new Error('lyra_self_approval_denied');
    const duplicate = this.approvals.get(input.idempotencyKey);
    if (duplicate) return { ...this.proposals.get(duplicate.actionId), idempotent: true };
    const action = this.proposals.get(input.actionId);
    if (!action) throw new Error('proposed_action_not_found');
    action.status = input.decision;
    this.approvals.set(input.idempotencyKey, { actionId: input.actionId });
    return { ...action, idempotent: false };
  }
  async createSyncRun({ id, provider, idempotencyKey }) {
    const prior = [...this.syncRuns.values()].find(
      (item) => item.idempotencyKey === idempotencyKey
    );
    if (prior) return { ...prior };
    const row = {
      id,
      provider,
      idempotencyKey,
      status: 'PENDING',
      currentStep: 'AUTHORIZE',
      completedSteps: [],
      attemptCount: 0,
    };
    this.syncRuns.set(id, row);
    return { ...row };
  }
  async updateSyncRun(id, fields) {
    Object.assign(this.syncRuns.get(id), fields);
    return { ...this.syncRuns.get(id) };
  }
  async upsertIntegrationRecord(record) {
    this.integrationRecords.push({ ...record });
    return { ...record };
  }
  async listSyncRuns() {
    return [...this.syncRuns.values()].map((item) => ({ ...item }));
  }
  async listIntegrationRecords() {
    return this.integrationRecords.map((item) => ({ ...item }));
  }
}
