export const PERSONAL_ATLAS_SCOPE = 'TACTICAL_ATLAS_PERSONAL';

export const GUARDIAN_POLICY = Object.freeze({
  scope: PERSONAL_ATLAS_SCOPE,
  dataBoundary: 'PERSONAL_PROJECT_ONLY',
  executionMode: 'READ_ONLY',
  destructiveActions: 'COMMANDER_CONFIRMATION_REQUIRED',
  providerCredentials: 'SERVER_ONLY',
});

export function validateGuardianScope(value) {
  return value === PERSONAL_ATLAS_SCOPE
    ? { allowed: true, policy: GUARDIAN_POLICY }
    : { allowed: false, code: 'PERSONAL_PROJECT_SCOPE_REQUIRED', policy: GUARDIAN_POLICY };
}
