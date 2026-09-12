import { isSameOrigin } from '../platform/security.js';

export const PERSONAL_ATLAS_SCOPE = 'TACTICAL_ATLAS_PERSONAL';

export const GUARDIAN_POLICY = Object.freeze({
  scope: PERSONAL_ATLAS_SCOPE,
  dataBoundary: 'PERSONAL_PROJECT_ONLY',
  executionMode: 'READ_ONLY',
  destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
  providerCredentials: 'SERVER_ONLY',
});

function deny(code) {
  return { allowed: false, code, policy: GUARDIAN_POLICY };
}

export function authorizeGuardianRequest(req) {
  if (!req || typeof req !== 'object') return deny('PERSONAL_PROJECT_REQUEST_REQUIRED');
  if (
    GUARDIAN_POLICY.dataBoundary !== 'PERSONAL_PROJECT_ONLY' ||
    GUARDIAN_POLICY.providerCredentials !== 'SERVER_ONLY'
  )
    return deny('PERSONAL_PROJECT_POLICY_REQUIRED');
  const origin = req.headers?.origin;
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
  if (!origin || !host || !isSameOrigin(req)) return deny('PERSONAL_PROJECT_ORIGIN_REQUIRED');
  const claimedScope = req.body?.scope;
  // A caller may never widen the boundary; a contradicting claim only ever denies.
  if (claimedScope !== undefined && claimedScope !== PERSONAL_ATLAS_SCOPE)
    return deny('PERSONAL_PROJECT_SCOPE_REQUIRED');
  return { allowed: true, policy: GUARDIAN_POLICY };
}
