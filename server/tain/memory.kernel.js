import crypto from 'node:crypto';
import { sha256 } from '../accounts/crypto.js';
import { commandRepository } from '../data/command.repository.js';

export const MEMORY_TYPES = Object.freeze(['FACT','COMMANDER_PREFERENCE','DECISION','OUTCOME','CORRECTION','INFERENCE','HYPOTHESIS']);
export const VERIFICATION_STATES = Object.freeze(['VERIFIED','UNVERIFIED','DISPUTED']);
export const SENSITIVITY_STATES = Object.freeze(['PUBLIC','INTERNAL','SENSITIVE','SECRET']);
export const RETENTION_POLICIES = Object.freeze(['MISSION','STANDARD','EXTENDED','PERMANENT']);
export const LEARNING_STATES = Object.freeze([
  'PENDING_REVIEW','AUTO_ACCEPTED','ACCEPTED','REJECTED','CONFLICT','AUTHORITATIVE','SUPERSEDED','ARCHIVED','DUPLICATE','NOT_CONFIGURED'
]);

function enumValue(value, allowed, name) {
  const normalized = String(value || '').toUpperCase();
  if (!allowed.includes(normalized)) throw new Error(`invalid_${name}`);
  return normalized;
}

function requiredText(value, name, max) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (!result || result.length > max) throw new Error(`invalid_${name}`);
  return result;
}

function optionalDate(value, name) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid_${name}`);
  return date.toISOString();
}

function optionalUuid(value, name) {
  if (!value) return null;
  const normalized = String(value);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) throw new Error(`invalid_${name}`);
  return normalized;
}

function normalizeContent(value) {
  return value.trim().replace(/\s+/g, ' ').normalize('NFKC');
}

function requireCommander(identity) {
  if (!identity?.isCommander) throw new Error('commander_authorization_required');
  const actor = String(identity.actor || 'COMMANDER');
  if (actor.startsWith('LYRA')) throw new Error('lyra_self_approval_denied');
  return actor;
}

function isInstructionLike(content) {
  return /(?:ignore (?:all|previous)|system prompt|developer message|execute (?:this|the)|reveal (?:secret|token)|BEGIN [A-Z ]+INSTRUCTIONS)/i.test(content);
}

function autoAcceptable(candidate, origin) {
  return origin?.isAuthorizedApi && candidate.memoryType === 'FACT' && candidate.verificationStatus === 'VERIFIED' &&
    candidate.provenance.sourceKind === 'AUTHORIZED_API' && candidate.sourceRecordRetained &&
    !['SENSITIVE','SECRET'].includes(candidate.sensitivity);
}

function memoryEvidence(memory, now = Date.now()) {
  const sourceTime = memory.sourceTimestamp ? new Date(memory.sourceTimestamp).getTime() : null;
  const reviewTime = memory.reviewAt ? new Date(memory.reviewAt).getTime() : null;
  const expiryTime = memory.expiresAt ? new Date(memory.expiresAt).getTime() : null;
  const stale = Boolean((reviewTime && reviewTime <= now) || (expiryTime && expiryTime <= now));
  return {
    memoryId: memory.id, type: memory.memoryType, source: memory.source, provenance: memory.provenance,
    sourceTimestamp: memory.sourceTimestamp, capturedAt: memory.capturedAt || memory.createdAt,
    freshnessSeconds: sourceTime ? Math.max(0, Math.round((now - sourceTime) / 1000)) : null,
    verificationStatus: memory.verificationStatus, confidence: Number(memory.confidence), stale,
    conflicting: false, missionId: memory.missionId, version: memory.version,
    trustBoundary: 'UNTRUSTED_DATA', instructionHandling: 'NEVER_EXECUTE_STORED_TEXT'
  };
}

export function createMemoryKernel(repository = commandRepository) {
  return Object.freeze({
    async submitCandidate(input, origin, idempotencyKey) {
      if (!origin?.isCommander && !origin?.isLyra && !origin?.isAuthorizedApi) throw new Error('memory_candidate_origin_denied');
      const content = normalizeContent(requiredText(input?.content, 'memory_content', 12_000));
      const confidence = Number(input?.confidence);
      if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) throw new Error('invalid_memory_confidence');
      const candidate = {
        id: crypto.randomUUID(), auditId: crypto.randomUUID(), memoryType: enumValue(input?.memoryType, MEMORY_TYPES, 'memory_type'),
        subjectKey: requiredText(input?.subjectKey, 'subject_key', 240).toLowerCase(),
        title: requiredText(input?.title, 'memory_title', 240), content, normalizedHash: sha256(content.toLowerCase()),
        source: requiredText(input?.source, 'memory_source', 2000),
        provenance: { ...(input?.provenance && typeof input.provenance === 'object' ? input.provenance : {}), containsInstructionLikeText: isInstructionLike(content) },
        sourceTimestamp: optionalDate(input?.sourceTimestamp, 'source_timestamp'), verificationStatus: enumValue(input?.verificationStatus, VERIFICATION_STATES, 'verification_status'),
        confidence, sensitivity: enumValue(input?.sensitivity, SENSITIVITY_STATES, 'sensitivity'),
        retentionPolicy: enumValue(input?.retentionPolicy, RETENTION_POLICIES, 'retention_policy'),
        expiresAt: optionalDate(input?.expiresAt, 'expires_at'), reviewAt: optionalDate(input?.reviewAt, 'review_at'),
        missionId: optionalUuid(input?.missionId, 'mission_id'), proposedBy: String(origin.actor || (origin.isAuthorizedApi ? 'SYSTEM_AUTHORIZED_API' : 'LYRA')),
        sourceRecordRetained: Boolean(input?.sourceRecordRetained), status: 'PENDING_REVIEW', idempotencyKey
      };
      if (candidate.retentionPolicy === 'MISSION' && !candidate.missionId) throw new Error('mission_retention_requires_mission');
      const duplicateRequest = await repository.findMemoryCandidateByIdempotency?.(idempotencyKey);
      if (duplicateRequest) return { candidate: duplicateRequest, idempotent: true };
      const existing = await repository.findAuthoritativeBySubject({ subjectKey: candidate.subjectKey, missionId: candidate.missionId });
      const duplicate = existing.find((memory) => sha256(normalizeContent(memory.content).toLowerCase()) === candidate.normalizedHash);
      if (duplicate) return { status: 'DUPLICATE', duplicateOf: duplicate.id, memory: duplicate, idempotent: true };
      const conflicts = existing.filter((memory) => memory.content !== candidate.content);
      if (conflicts.length) candidate.status = 'CONFLICT';
      const stored = await repository.createMemoryCandidate(candidate);
      for (const memory of conflicts) {
        await repository.createMemoryConflict({ id: crypto.randomUUID(), auditId: crypto.randomUUID(), actor: candidate.proposedBy, candidateId: stored.id, existingMemoryId: memory.id, conflictType: 'SAME_SUBJECT_DIFFERENT_CONTENT' });
      }
      if (conflicts.length) await repository.markCandidateConflict(stored.id);
      if (!conflicts.length && autoAcceptable(candidate, origin)) {
        const memory = await repository.acceptMemoryCandidate({
          candidateId: stored.id, memoryId: crypto.randomUUID(), auditId: crypto.randomUUID(), actor: 'SYSTEM_AUTHORIZED_API',
          idempotencyKey: `${idempotencyKey}:auto`, reason: 'Verified authorized API fact with retained source.'
        });
        return { candidate: { ...stored, status: 'AUTO_ACCEPTED' }, memory, autoAccepted: true, idempotent: false };
      }
      return { candidate: stored, conflicts, autoAccepted: false, idempotent: false };
    },

    async reviewCandidate(candidateId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const action = String(input?.action || '').toUpperCase();
      const candidate = await repository.getMemoryCandidate(candidateId);
      if (!candidate) throw new Error('memory_candidate_not_found');
      if (action === 'REJECT') {
        const rejected = await repository.rejectMemoryCandidate({ candidateId, auditId: crypto.randomUUID(), actor, reason: requiredText(input?.reason, 'review_reason', 1000), idempotencyKey });
        if (!rejected) throw new Error('memory_candidate_not_reviewable');
        return rejected;
      }
      if (action !== 'ACCEPT' && action !== 'SUPERSEDE') throw new Error('invalid_memory_review_action');
      if (candidate.memoryType === 'FACT' && candidate.verificationStatus !== 'VERIFIED') throw new Error('unverified_fact_cannot_be_authoritative');
      if (candidate.status === 'CONFLICT' && action !== 'SUPERSEDE') throw new Error('memory_conflict_requires_resolution');
      const supersedesMemoryId = action === 'SUPERSEDE' ? optionalUuid(requiredText(input?.supersedesMemoryId, 'supersedes_memory_id', 64), 'supersedes_memory_id') : null;
      const reason = requiredText(input?.reason, 'review_reason', 1000);
      if (supersedesMemoryId) {
        const conflicts = await repository.listMemoryConflicts({ status: 'OPEN', missionId: candidate.missionId || null });
        if (!conflicts.some((conflict) => conflict.candidateId === candidateId && conflict.existingMemoryId === supersedesMemoryId)) throw new Error('memory_conflict_resolution_mismatch');
      }
      return repository.acceptMemoryCandidate({
        candidateId, memoryId: crypto.randomUUID(), auditId: crypto.randomUUID(), actor, idempotencyKey, reason, supersedesMemoryId
      });
    },

    async correctMemory(memoryId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const submitted = await this.submitCandidate({
        ...input, memoryType: 'CORRECTION', subjectKey: input?.subjectKey,
        provenance: { ...(input?.provenance || {}), correctedMemoryId: memoryId }
      }, { isCommander: true, actor }, `${idempotencyKey}:candidate`);
      if (!submitted.candidate) return submitted;
      const memory = await repository.acceptMemoryCandidate({
        candidateId: submitted.candidate.id, memoryId: crypto.randomUUID(), auditId: crypto.randomUUID(), actor,
        idempotencyKey: `${idempotencyKey}:accept`, reason: requiredText(input?.reason, 'correction_reason', 1000), supersedesMemoryId: memoryId
      });
      return { candidate: submitted.candidate, memory, corrected: true };
    },

    async archiveMemory(memoryId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const archived = await repository.archiveMemory({ memoryId, auditId: crypto.randomUUID(), actor, reason: requiredText(input?.reason, 'archive_reason', 1000), idempotencyKey });
      if (!archived) throw new Error('memory_not_archivable');
      return archived;
    },

    async deleteMemory(memoryId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const deleted = await repository.deleteMemory({ memoryId, auditId: crypto.randomUUID(), actor, reason: requiredText(input?.reason, 'deletion_reason', 1000), idempotencyKey });
      if (!deleted) throw new Error('memory_deletion_not_permitted');
      return deleted;
    },

    async retrieve(search, { missionId = null, includeGlobal = true, limit = 10 } = {}) {
      const query = requiredText(search, 'memory_query', 500);
      const records = await repository.searchMemories({ query, missionId, includeGlobal, limit: Math.min(Math.max(Number(limit) || 10, 1), 25) });
      const conflicts = await repository.listMemoryConflicts({ status: 'OPEN', missionId });
      const conflictingIds = new Set(conflicts.map((item) => item.existingMemoryId));
      return {
        status: 'READY', query, missionScope: missionId, includeGlobal,
        results: records.map((memory) => ({
          ...memory,
          evidence: { ...memoryEvidence(memory), conflicting: conflictingIds.has(memory.id) }
        })),
        warnings: records.flatMap((memory) => {
          const evidence = memoryEvidence(memory);
          return [...(evidence.stale ? [{ memoryId: memory.id, code: 'STALE_MEMORY' }] : []),
            ...(conflictingIds.has(memory.id) ? [{ memoryId: memory.id, code: 'MEMORY_CONFLICT' }] : [])];
        }),
        learningMode: 'GOVERNED_RETRIEVAL_ONLY', executionMode: 'READ_ONLY'
      };
    },

    listCandidates(options) { return repository.listMemoryCandidates(options); },
    listConflicts(options) { return repository.listMemoryConflicts(options); }
  });
}

export const memoryKernel = createMemoryKernel();
