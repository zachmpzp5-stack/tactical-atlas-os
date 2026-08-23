import crypto from 'node:crypto';
import { commandRepository } from '../data/command.repository.js';

export const MISSION_STATES = Object.freeze(['DRAFT','REVIEW','APPROVED','ACTIVE','BLOCKED','COMPLETE','ARCHIVED']);
export const MISSION_TRANSITIONS = Object.freeze({
  DRAFT: Object.freeze(['REVIEW','ARCHIVED']),
  REVIEW: Object.freeze(['DRAFT','APPROVED','ARCHIVED']),
  APPROVED: Object.freeze(['ACTIVE','ARCHIVED']),
  ACTIVE: Object.freeze(['BLOCKED','COMPLETE','ARCHIVED']),
  BLOCKED: Object.freeze(['ACTIVE','COMPLETE','ARCHIVED']),
  COMPLETE: Object.freeze(['ARCHIVED']),
  ARCHIVED: Object.freeze([])
});

function requireCommander(identity) {
  if (!identity?.isCommander || String(identity.actor || '').startsWith('LYRA')) throw new Error('commander_authorization_required');
  return String(identity.actor || 'COMMANDER');
}

function text(value, name, max, min = 1) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (result.length < min || result.length > max) throw new Error(`invalid_${name}`);
  return result;
}

export function createMissionEngine(repository = commandRepository) {
  return Object.freeze({
    async list(options) { return repository.listMissions(options); },
    async detail(id) { return repository.getMissionDetail(id); },

    async create(input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const title = text(input?.title, 'mission_title', 160);
      const summary = text(input?.summary || '', 'mission_summary', 4000, 0);
      const reason = text(input?.reason, 'transition_reason', 1000);
      const duplicate = await repository.findMissionByIdempotency?.(idempotencyKey);
      if (duplicate) return { ...duplicate, idempotent: true };
      return repository.createMission({
        id: crypto.randomUUID(), eventId: crypto.randomUUID(), auditId: crypto.randomUUID(),
        title, summary, actor, reason, idempotencyKey
      });
    },

    async transition(missionId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const nextState = String(input?.nextState || '').toUpperCase();
      const reason = text(input?.reason, 'transition_reason', 1000);
      if (!MISSION_STATES.includes(nextState)) throw new Error('invalid_mission_state');
      const duplicate = await repository.findMissionByIdempotency?.(idempotencyKey);
      if (duplicate) {
        if (duplicate.id !== missionId) throw new Error('idempotency_conflict');
        return { ...duplicate, idempotent: true };
      }
      const current = await repository.getMission(missionId);
      if (!current) throw new Error('mission_not_found');
      if (!MISSION_TRANSITIONS[current.state]?.includes(nextState)) throw new Error('illegal_mission_transition');
      return repository.transitionMission({
        missionId, eventId: crypto.randomUUID(), auditId: crypto.randomUUID(), nextState,
        actor, reason, idempotencyKey
      });
    },

    async addObjective(missionId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      if (!(await repository.getMission(missionId))) throw new Error('mission_not_found');
      return repository.createObjective({
        id: crypto.randomUUID(), auditId: crypto.randomUUID(), missionId,
        title: text(input?.title, 'objective_title', 240),
        position: Math.max(0, Math.min(10_000, Number(input?.position) || 0)),
        actor, idempotencyKey
      });
    },

    async addEvidence(missionId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      if (!(await repository.getMission(missionId))) throw new Error('mission_not_found');
      const confidence = Number(input?.confidence);
      if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) throw new Error('invalid_evidence_confidence');
      const verificationStatus = String(input?.verificationStatus || '').toUpperCase();
      if (!['VERIFIED','UNVERIFIED','DISPUTED','UNAVAILABLE'].includes(verificationStatus)) throw new Error('invalid_verification_status');
      return repository.createEvidence({
        evidenceId: crypto.randomUUID(), sourceId: crypto.randomUUID(), auditId: crypto.randomUUID(), missionId,
        sourceType: text(input?.sourceType, 'source_type', 80), sourceTitle: text(input?.sourceTitle, 'source_title', 240),
        locator: text(input?.locator, 'source_locator', 2000), sourceTimestamp: input?.sourceTimestamp || null,
        verificationStatus, title: text(input?.title, 'evidence_title', 240),
        excerpt: text(input?.excerpt || '', 'evidence_excerpt', 4000, 0),
        classification: text(input?.classification || 'INTERNAL', 'classification', 40),
        confidence, actor, idempotencyKey
      });
    }
  });
}

export const missionEngine = createMissionEngine();
