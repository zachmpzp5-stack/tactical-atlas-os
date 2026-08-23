export const VERIFICATION_STATES = Object.freeze({
  VERIFIED: 'VERIFIED', UNVERIFIED: 'UNVERIFIED', DISCONNECTED: 'DISCONNECTED',
  NOT_CONFIGURED: 'NOT_CONFIGURED', ERROR: 'ERROR'
});
export const EXECUTION_MODES = Object.freeze({ READ_ONLY: 'READ_ONLY' });
export function createRequestId() { return globalThis.crypto?.randomUUID?.() || `atlas-${Date.now().toString(36)}`; }
export function publicError(code, message) { return { error: { code, message } }; }
