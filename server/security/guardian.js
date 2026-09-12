export const PERSONAL_ATLAS_SCOPE = 'TACTICAL_ATLAS_PERSONAL';

export const GUARDIAN_POLICY = Object.freeze({
  scope: PERSONAL_ATLAS_SCOPE,
  dataBoundary: 'PERSONAL_PROJECT_ONLY',
  executionMode: 'READ_ONLY',
  destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
  providerCredentials: 'SERVER_ONLY',
});

export function authorizeGuardianRequest() {
  const allowed =
    GUARDIAN_POLICY.scope === PERSONAL_ATLAS_SCOPE &&
    GUARDIAN_POLICY.dataBoundary === 'PERSONAL_PROJECT_ONLY';
  return allowed
    ? { allowed: true, policy: GUARDIAN_POLICY }
    : { allowed: false, code: 'PERSONAL_PROJECT_POLICY_REQUIRED', policy: GUARDIAN_POLICY };
}
