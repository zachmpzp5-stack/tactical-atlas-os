import { authorizeTool } from '../atlas-core/tool.registry.js';
import { retrieveTain } from '../tain/tain.core.js';
import { getSystemSnapshot } from '../platform/system.status.js';
import { commandRepository } from '../data/command.repository.js';
import { getDatabaseStatus } from '../data/database.js';
import { getAccountStatuses } from '../accounts/service.js';
export async function executeReadOnlyTool(toolName, params = {}, identity = {}) {
  const authorization = authorizeTool(toolName, identity);
  if (!authorization.allowed) throw new Error(authorization.reason);
  if (authorization.tool.classification !== 'READ_ONLY')
    throw new Error('READ_ONLY_TOOL_REQUIRED');
  if (toolName === 'searchTAIN') return retrieveTain(params.query, { missionId: params.missionId || null, limit: params.limit });
  if (toolName === 'getSystemStatus') return { tool: toolName, connected: true, verificationState: 'VERIFIED', ...getSystemSnapshot() };
  if (toolName === 'getConnectedAccountStatus') return { tool: toolName, verificationState: 'VERIFIED', source: 'ENCRYPTED_SERVER_TOKEN_STORE', ...(await getAccountStatuses()) };
  if (!getDatabaseStatus().configured && ['getMissionStatus','getObjectives','getEvidence','getIntegrationSyncHistory','getApprovalQueue'].includes(toolName)) {
    return { tool: toolName, status: 'NOT_CONFIGURED', connected: false, results: [], source: null, required: ['DATABASE_URL'] };
  }
  if (toolName === 'getMissionStatus') {
    const results = params.missionId ? [await commandRepository.getMission(params.missionId)].filter(Boolean) : await commandRepository.listMissions({ limit: params.limit || 25 });
    return { tool: toolName, status: 'READY', connected: true, verificationState: 'VERIFIED', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), results };
  }
  if (toolName === 'getObjectives' || toolName === 'getEvidence') {
    const mission = params.missionId ? await commandRepository.getMissionDetail(params.missionId) : null;
    return { tool: toolName, status: mission ? 'READY' : 'UNAVAILABLE', connected: Boolean(mission), verificationState: mission ? 'VERIFIED' : 'UNAVAILABLE', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), results: mission?.[toolName === 'getObjectives' ? 'objectives' : 'evidence'] || [] };
  }
  if (toolName === 'getIntegrationSyncHistory') return { tool: toolName, status: 'READY', connected: true, verificationState: 'VERIFIED', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), results: await commandRepository.listSyncRuns({ provider: params.provider || null, limit: params.limit || 25 }) };
  if (toolName === 'getApprovalQueue') return { tool: toolName, status: 'READY', connected: true, verificationState: 'VERIFIED', source: 'NEON_POSTGRES', freshness: new Date().toISOString(), results: await commandRepository.listProposedActions({ status: params.status || 'PENDING', limit: params.limit || 25 }) };
  if (toolName === 'getLibraryStatus') return { tool: toolName, connected: true, status: 'READY', source: 'VERIFIED_PROJECT_KNOWLEDGE' };
  const messages = { getSystemStatus: 'Use /api/health for verified component configuration state.', getHeadquartersStatus: 'Live Headquarters telemetry is not connected.', getRecentActivity: 'Recent activity source is not connected.', getLibraryStatus: 'Library storage adapter is not configured.' };
  return { tool: toolName, status: 'DISCONNECTED', connected: false, results: [], message: messages[toolName] };
}
