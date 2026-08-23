import { missionEngine } from '../server/missions/mission.engine.js';
import { memoryKernel } from '../server/tain/memory.kernel.js';
import { approvalService } from '../server/approvals/approval.service.js';
import { integrationSyncService } from '../server/integrations/sync.service.js';
import { getDatabaseStatus } from '../server/data/database.js';
import { consumeRateLimit } from '../server/security/rate-limit.js';
import { prepareJsonResponse, requireCommander, requireIdempotencyKey, requireJsonWrite } from '../server/platform/http.js';
import { safeLogError } from '../server/security/redaction.js';

const ROUTES = Object.freeze({
  missions: { methods: ['GET','POST'], write: (req) => req.method === 'POST' },
  'mission-detail': { methods: ['GET'] },
  'mission-transition': { methods: ['POST'], write: true },
  'mission-objectives': { methods: ['POST'], write: true },
  'mission-evidence': { methods: ['POST'], write: true },
  'tain-search': { methods: ['GET'] },
  'memory-candidates': { methods: ['GET','POST'], write: (req) => req.method === 'POST' },
  'memory-candidate-decision': { methods: ['POST'], write: true },
  'memory-conflicts': { methods: ['GET'] },
  'memory-action': { methods: ['POST'], write: true },
  proposals: { methods: ['GET'] },
  'proposal-decision': { methods: ['POST'], write: true },
  'integration-sync': { methods: ['POST'], write: true },
  'integration-sync-history': { methods: ['GET'] },
  'integration-records': { methods: ['GET'] }
});

function isWrite(route, req) {
  return typeof route.write === 'function' ? route.write(req) : Boolean(route.write);
}

function uuid(value, name) {
  const result = String(value || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result)) throw new Error(`invalid_${name}`);
  return result;
}

function optionalUuid(value, name) {
  return value ? uuid(value, name) : null;
}

function queryLimit(value, fallback = 50) {
  return Math.min(Math.max(Number(value) || fallback, 1), 100);
}

function errorStatus(error) {
  if (error.message === 'database_not_configured') return 503;
  if (error.message.includes('not_found')) return 404;
  if (error.message.includes('authorization') || error.message.includes('self_approval')) return 403;
  if (error.message.includes('already_decided') || error.message.includes('idempotency_conflict')) return 409;
  if (error.message.includes('illegal_') || error.message.startsWith('invalid_') || error.message.includes('cannot_be_authoritative') || error.message.includes('not_permitted')) return 422;
  return 500;
}

export default async function handler(req, res) {
  prepareJsonResponse(res);
  const routeName = String(req.query?.route || '');
  const route = ROUTES[routeName];
  if (!route) return res.status(404).json({ error: 'Command route not found.', code: 'COMMAND_ROUTE_NOT_FOUND' });
  if (!route.methods.includes(req.method)) {
    res.setHeader('Allow', route.methods.join(', '));
    return res.status(405).json({ error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' });
  }
  const session = requireCommander(req, res);
  if (!session) return;
  const identity = { isCommander: true, actor: `COMMANDER:${session.binding.slice(0, 12)}` };
  const write = isWrite(route, req);
  let idempotencyKey = null;
  if (write) {
    if (!requireJsonWrite(req, res)) return;
    idempotencyKey = requireIdempotencyKey(req, res);
    if (!idempotencyKey) return;
    const limit = await consumeRateLimit(session.binding, { action: routeName, limit: 30, windowSeconds: 60 });
    if (!limit.allowed) {
      return res.status(limit.status === 'NOT_CONFIGURED' ? 503 : 429).json({
        status: limit.status || 'RATE_LIMITED', error: limit.status === 'NOT_CONFIGURED' ? 'Upstash rate limiting is required in production.' : 'Too many requests.'
      });
    }
  }
  if (!getDatabaseStatus().configured) {
    return res.status(503).json({ status: 'NOT_CONFIGURED', source: 'SERVER_ENVIRONMENT', required: ['DATABASE_URL'], records: [] });
  }
  try {
    if (routeName === 'missions' && req.method === 'GET') {
      return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), missions: await missionEngine.list({ limit: queryLimit(req.query?.limit) }) });
    }
    if (routeName === 'missions') return res.status(201).json(await missionEngine.create(req.body, identity, idempotencyKey));
    if (routeName === 'mission-detail') {
      const mission = await missionEngine.detail(uuid(req.query?.missionId, 'mission_id'));
      return mission ? res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), mission })
        : res.status(404).json({ error: 'Mission not found.', code: 'MISSION_NOT_FOUND' });
    }
    if (routeName === 'mission-transition') return res.status(200).json(await missionEngine.transition(uuid(req.query?.missionId, 'mission_id'), req.body, identity, idempotencyKey));
    if (routeName === 'mission-objectives') return res.status(201).json(await missionEngine.addObjective(uuid(req.query?.missionId, 'mission_id'), req.body, identity, idempotencyKey));
    if (routeName === 'mission-evidence') return res.status(201).json(await missionEngine.addEvidence(uuid(req.query?.missionId, 'mission_id'), req.body, identity, idempotencyKey));
    if (routeName === 'tain-search') {
      const data = await memoryKernel.retrieve(req.query?.q, { missionId: optionalUuid(req.query?.missionId, 'mission_id'), includeGlobal: req.query?.includeGlobal !== '0', limit: queryLimit(req.query?.limit, 10) });
      return res.status(200).json({ ...data, source: 'NEON_POSTGRES', freshness: new Date().toISOString() });
    }
    if (routeName === 'memory-candidates' && req.method === 'GET') {
      return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), candidates: await memoryKernel.listCandidates({ status: req.query?.status || null, missionId: optionalUuid(req.query?.missionId, 'mission_id'), limit: queryLimit(req.query?.limit) }) });
    }
    if (routeName === 'memory-candidates') {
      return res.status(201).json(await memoryKernel.submitCandidate(req.body, { isCommander: true, actor: identity.actor }, idempotencyKey));
    }
    if (routeName === 'memory-candidate-decision') {
      return res.status(200).json(await memoryKernel.reviewCandidate(uuid(req.query?.candidateId, 'candidate_id'), req.body, identity, idempotencyKey));
    }
    if (routeName === 'memory-conflicts') {
      return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), conflicts: await memoryKernel.listConflicts({ status: req.query?.status || 'OPEN', missionId: optionalUuid(req.query?.missionId, 'mission_id') }) });
    }
    if (routeName === 'memory-action') {
      const memoryId = uuid(req.query?.memoryId, 'memory_id');
      const action = String(req.body?.action || '').toUpperCase();
      if (action === 'CORRECT' || action === 'SUPERSEDE') return res.status(201).json(await memoryKernel.correctMemory(memoryId, req.body, identity, idempotencyKey));
      if (action === 'ARCHIVE') return res.status(200).json(await memoryKernel.archiveMemory(memoryId, req.body, identity, idempotencyKey));
      if (action === 'DELETE') return res.status(200).json(await memoryKernel.deleteMemory(memoryId, req.body, identity, idempotencyKey));
      throw new Error('invalid_memory_action');
    }
    if (routeName === 'proposals') {
      return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), proposals: await approvalService.list({ status: req.query?.status || null, limit: queryLimit(req.query?.limit) }) });
    }
    if (routeName === 'proposal-decision') {
      return res.status(200).json(await approvalService.decide(uuid(req.query?.actionId, 'action_id'), req.body, identity, idempotencyKey));
    }
    if (routeName === 'integration-sync') return res.status(200).json(await integrationSyncService.run(req.body?.provider, idempotencyKey));
    if (routeName === 'integration-sync-history') {
      return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), runs: await integrationSyncService.history({ provider: req.query?.provider || null, limit: queryLimit(req.query?.limit, 25) }) });
    }
    return res.status(200).json({ status: 'READY', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), records: await integrationSyncService.records({ provider: req.query?.provider || null, limit: queryLimit(req.query?.limit, 25) }) });
  } catch (error) {
    safeLogError('[COMMAND_API_ERROR]', error, { route: routeName });
    return res.status(errorStatus(error)).json({ error: error.message, code: error.message.toUpperCase(), executionMode: 'READ_ONLY' });
  }
}
