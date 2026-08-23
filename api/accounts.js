import crypto from 'node:crypto';
import { startAccountLink, completeAccountLink, disconnectAccount, getAccountStatuses } from '../server/accounts/service.js';
import { requirePublicUrl } from '../server/accounts/providers.js';
import { getDatabaseStatus } from '../server/data/database.js';
import { commandRepository } from '../server/data/command.repository.js';
import { consumeRateLimit } from '../server/security/rate-limit.js';
import { requireIdempotencyKey } from '../server/platform/http.js';
import { prepareAccountResponse, redirect, requireCommander, requireSameOriginJson } from './accounts/_http.js';

async function start(req, res, session) {
  const limit = await consumeRateLimit(session.binding, { action: 'account-link-start', limit: 12, windowSeconds: 60 });
  if (!limit.allowed) return res.status(limit.status === 'NOT_CONFIGURED' ? 503 : 429).json({ error: limit.status === 'NOT_CONFIGURED' ? 'Rate limiting is not configured.' : 'Too many requests.' });
  try { return redirect(res, await startAccountLink(req.query?.provider, session.binding)); }
  catch (error) { return res.status(error.message === 'unknown_provider' ? 404 : 503).json({ error: error.message }); }
}

async function callback(req, res, session) {
  let publicUrl;
  try { publicUrl = requirePublicUrl(); }
  catch { return res.status(503).json({ error: 'Account linking is not safely configured.' }); }
  const provider = req.query?.provider;
  try {
    await completeAccountLink(provider, req.query || {}, session.binding);
    return redirect(res, `${publicUrl}/settings?account=${encodeURIComponent(provider)}&result=linked`);
  } catch (error) {
    const code = ['oauth_state_invalid_or_replayed','oauth_state_expired','oauth_provider_mismatch','oauth_session_mismatch'].includes(error.message)
      ? error.message : 'link_failed';
    return redirect(res, `${publicUrl}/settings?account=${encodeURIComponent(provider)}&result=${encodeURIComponent(code)}`);
  }
}

async function disconnect(req, res, session) {
  if (!requireSameOriginJson(req, res)) return;
  const idempotencyKey = requireIdempotencyKey(req, res);
  if (!idempotencyKey) return;
  const limit = await consumeRateLimit(session.binding, { action: 'account-disconnect', limit: 12, windowSeconds: 60 });
  if (!limit.allowed) return res.status(limit.status === 'NOT_CONFIGURED' ? 503 : 429).json({ error: limit.status === 'NOT_CONFIGURED' ? 'Rate limiting is not configured.' : 'Too many requests.' });
  try {
    const provider = req.body?.provider;
    const revocation = await disconnectAccount(provider);
    let dataDeletion = { status: 'NOT_CONFIGURED', reason: 'DATABASE_URL_REQUIRED' };
    if (getDatabaseStatus().configured) {
      const deleted = await commandRepository.deleteIntegrationData({
        provider, auditId: crypto.randomUUID(), actor: `COMMANDER:${session.binding.slice(0, 12)}`,
        idempotencyKey
      });
      dataDeletion = { status: 'COMPLETE', ...deleted };
    }
    return res.status(200).json({ disconnected: true, revocation, dataDeletion });
  } catch (error) {
    return res.status(error.message === 'provider_unavailable' ? 404 : 503).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  prepareAccountResponse(res);
  const route = String(req.query?.route || '');
  const methods = { start: 'GET', callback: 'GET', status: 'GET', disconnect: 'POST' };
  if (!methods[route]) return res.status(404).json({ error: 'Account route not found.' });
  if (req.method !== methods[route]) { res.setHeader('Allow', methods[route]); return res.status(405).json({ error: 'Method not allowed.' }); }
  const session = requireCommander(req, res);
  if (!session) return;
  if (route === 'status') return res.status(200).json(await getAccountStatuses());
  if (route === 'start') return start(req, res, session);
  if (route === 'callback') return callback(req, res, session);
  return disconnect(req, res, session);
}
