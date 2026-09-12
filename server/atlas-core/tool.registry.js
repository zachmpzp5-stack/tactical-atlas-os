import { EXECUTION_MODES, VERIFICATION_STATES } from '../platform/contracts.js';
const definitions = [
  ['getSystemStatus', 'SYSTEM', 'STANDARD'], ['getRecentActivity', 'SYSTEM', 'STANDARD'],
  ['getMissionStatus', 'MISSION', 'OMEGA'], ['getObjectives', 'MISSION', 'OMEGA'],
  ['getEvidence', 'MISSION', 'OMEGA'], ['searchTAIN', 'TAIN', 'OMEGA'],
  ['getConnectedAccountStatus', 'INTEGRATION', 'OMEGA'], ['getIntegrationSyncHistory', 'INTEGRATION', 'OMEGA'],
  ['getApprovalQueue', 'MISSION', 'OMEGA'], ['getHeadquartersStatus', 'HQ', 'OMEGA'],
  ['getLibraryStatus', 'LIBRARY', 'OMEGA'], ['proposeAction', 'MISSION', 'OMEGA', 'PROPOSAL_ONLY']
].map(([name, domain, requiredClearance, classification = EXECUTION_MODES.READ_ONLY]) => Object.freeze({ name, domain, requiredClearance, classification, availability: VERIFICATION_STATES.DISCONNECTED }));
export const TOOL_REGISTRY = Object.freeze(Object.fromEntries(definitions.map((tool) => [tool.name, tool])));
export function authorizeTool(name, identity = {}) {
  const tool = TOOL_REGISTRY[name];
  if (!tool) return { allowed: false, reason: 'UNKNOWN_TOOL', tool: null };
  if (tool.requiredClearance === 'OMEGA' && !identity.isCommander) return { allowed: false, reason: 'INSUFFICIENT_CLEARANCE', tool };
  return { allowed: true, reason: 'AUTHORIZED_READ_ONLY', tool };
}
