import { ATLAS_CORE } from '../atlas-core/atlas.core.js';
import { getTainHealth } from '../tain/tain.core.js';
import { getVoiceStatus } from '../lyra/lyra.voice.js';
import { getModelProviderStatus } from '../providers/model.provider.js';
import { getIntegrationStatuses } from './integrations.js';
import { getCloudInfrastructureStatus } from './cloud.infrastructure.js';
import { getDatabaseStatus } from '../data/database.js';
import { getRateLimitStatus } from '../security/rate-limit.js';
export function getSystemSnapshot() {
  const database = getDatabaseStatus();
  return {
    service: 'tactical-atlas-os', version: '4.6.0', status: 'READY', executionMode: 'READ_ONLY',
    security: { commanderSession: 'HTTP_ONLY_SIGNED', authorizationSource: 'SERVER_SESSION', cors: 'SAME_ORIGIN', rateLimiter: getRateLimitStatus(), auditLog: database.configured ? 'IMMUTABLE_HASH_CHAIN_CONFIGURED' : 'NOT_CONFIGURED' },
    cloud: getCloudInfrastructureStatus(),
    components: {
      COMMANDER_AUTH: { status: process.env.COMMANDER_AUTH_KEY && process.env.COMMANDER_SESSION_SECRET ? 'READY' : 'NOT_CONFIGURED' },
      LYRA: { status: 'READY' }, ATLAS_CORE: { status: ATLAS_CORE.status, version: ATLAS_CORE.version },
      TAIN: getTainHealth(), VOICE: getVoiceStatus(), MODEL_PROVIDER: getModelProviderStatus(),
      MISSIONS: { status: database.status, persistence: database.provider, source: database.source },
      AI_BRAIN_KERNEL: { status: database.status, learningMode: 'GOVERNED_RETRIEVAL_ONLY', modelWeightTraining: 'DISABLED', autonomousModification: 'DISABLED', source: database.source },
      APPROVAL_QUEUE: { status: database.status, executionMode: 'PROPOSAL_ONLY', source: database.source },
      INTEGRATION_SYNC: { status: database.status, implementedProviders: ['youtube'], source: database.source },
      LIBRARY: { status: database.status, source: database.configured ? 'NEON_POSTGRES_TAIN' : null }
    },
    integrations: getIntegrationStatuses(), timestamp: new Date().toISOString()
  };
}
