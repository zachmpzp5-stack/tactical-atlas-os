import crypto from 'node:crypto';
import { commandRepository } from '../data/command.repository.js';

function requireCommander(identity) {
  if (!identity?.isCommander) throw new Error('commander_authorization_required');
  const actor = String(identity.actor || 'COMMANDER');
  if (actor.startsWith('LYRA')) throw new Error('lyra_self_approval_denied');
  return actor;
}

function requiredText(value, name, max) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (!result || result.length > max) throw new Error(`invalid_${name}`);
  return result;
}

export function createApprovalService(repository = commandRepository) {
  return Object.freeze({
    list(options) { return repository.listProposedActions(options); },

    propose(input, origin, idempotencyKey) {
      const proposedBy = String(origin?.actor || 'LYRA');
      if (!origin?.isLyra && !origin?.isCommander) throw new Error('proposal_origin_denied');
      return repository.createProposedAction({
        id: crypto.randomUUID(), auditId: crypto.randomUUID(), missionId: input?.missionId || null,
        title: requiredText(input?.title, 'proposal_title', 240),
        description: requiredText(input?.description, 'proposal_description', 4000),
        proposedBy, idempotencyKey
      });
    },

    decide(actionId, input, identity, idempotencyKey) {
      const actor = requireCommander(identity);
      const decision = String(input?.decision || '').toUpperCase();
      if (!['APPROVED','REJECTED'].includes(decision)) throw new Error('invalid_approval_decision');
      return repository.decideProposedAction({
        actionId, approvalId: crypto.randomUUID(), auditId: crypto.randomUUID(), decision,
        actor, reason: requiredText(input?.reason, 'approval_reason', 1000), idempotencyKey
      });
    }
  });
}

export const approvalService = createApprovalService();
