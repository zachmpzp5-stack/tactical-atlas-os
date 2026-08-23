import { EXECUTION_MODES, VERIFICATION_STATES, createRequestId } from '../platform/contracts.js';
import { authorizeTool } from './tool.registry.js';
export const ATLAS_CORE = Object.freeze({ name: 'ATLAS CORE', version: '2.0.0', status: 'READY' });
const DOMAIN_RULES = Object.freeze([
  ['SYSTEM', /\b(system|health|status)\b/i], ['MISSION', /\b(mission|objective|operation)\b/i],
  ['TAIN', /\b(tain|memory|record)\b/i], ['LIBRARY', /\b(library|archive|dossier)\b/i], ['HQ', /\b(headquarters|hq)\b/i]
]);
export function classifyDomain(message = '') { return DOMAIN_RULES.find(([, pattern]) => pattern.test(String(message)))?.[0] || 'GENERAL_ANALYSIS'; }
export function runAtlasCore({ message = '', identity = {}, requestedTool = null, memoryAvailable = true } = {}) {
  const domain = classifyDomain(message);
  const toolDecision = requestedTool ? authorizeTool(requestedTool, identity) : null;
  return {
    core: ATLAS_CORE.name, version: ATLAS_CORE.version, status: ATLAS_CORE.status, requestId: createRequestId(),
    identity: { profile: identity.profile || 'LYRA_STANDARD', clearance: identity.isCommander ? 'OMEGA' : 'STANDARD', isCommander: Boolean(identity.isCommander) },
    intent: domain === 'GENERAL_ANALYSIS' ? 'ANALYZE' : 'RETRIEVE', domain,
    requiredClearance: toolDecision?.tool?.requiredClearance || 'STANDARD', accessDecision: toolDecision ? (toolDecision.allowed ? 'ALLOW' : 'DENY') : 'ALLOW',
    executionMode: EXECUTION_MODES.READ_ONLY, toolPlan: toolDecision ? { name: requestedTool, ...toolDecision } : null,
    memoryPlan: { action: domain === 'TAIN' ? 'SEARCH' : 'NONE', availability: memoryAvailable ? 'PERSISTENT_SOURCE_BACKED' : VERIFICATION_STATES.NOT_CONFIGURED },
    providerPlan: { action: 'GENERATE_RESPONSE', provider: process.env.ATLAS_AI_PROVIDER || 'VERCEL_AI_GATEWAY' },
    verificationState: VERIFICATION_STATES.VERIFIED, timestamp: new Date().toISOString()
  };
}
