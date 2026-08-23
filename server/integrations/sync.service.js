import crypto from 'node:crypto';
import { getDatabaseStatus } from '../data/database.js';
import { commandRepository } from '../data/command.repository.js';
import { memoryKernel } from '../tain/memory.kernel.js';
import { safeLogError } from '../security/redaction.js';
import { fetchYouTubeChannels, getYouTubeAccessToken } from './youtube.js';

const SUPPORTED_SYNC_PROVIDERS = new Set(['youtube']);

export function createIntegrationSyncService(repository = commandRepository, kernel = memoryKernel) {
  return Object.freeze({
    async run(providerId, idempotencyKey) {
      const provider = String(providerId || '').toLowerCase();
      if (!getDatabaseStatus().configured) return { provider, status: 'NOT_CONFIGURED', reason: 'DATABASE_URL_REQUIRED' };
      if (!SUPPORTED_SYNC_PROVIDERS.has(provider)) return { provider, status: 'NOT_CONFIGURED', reason: 'READ_ONLY_SYNC_NOT_IMPLEMENTED' };
      const run = await repository.createSyncRun({ id: crypto.randomUUID(), provider, idempotencyKey });
      if (run.status === 'SUCCEEDED') return { ...run, idempotent: true };
      const attemptCount = Number(run.attemptCount || 0) + 1;
      const completedSteps = Array.isArray(run.completedSteps) ? run.completedSteps : [];
      await repository.updateSyncRun(run.id, { status: 'RUNNING', currentStep: 'AUTHORIZE', completedSteps, attemptCount });
      try {
        const token = await getYouTubeAccessToken();
        if (!completedSteps.includes('AUTHORIZE')) completedSteps.push('AUTHORIZE');
        await repository.updateSyncRun(run.id, { status: 'RUNNING', currentStep: 'RETRIEVE', completedSteps, attemptCount });
        const records = await fetchYouTubeChannels(token);
        if (!completedSteps.includes('RETRIEVE')) completedSteps.push('RETRIEVE');
        await repository.updateSyncRun(run.id, { status: 'RUNNING', currentStep: 'NORMALIZE_AND_STORE', completedSteps, attemptCount });
        for (const record of records) {
          await repository.upsertIntegrationRecord({ id: crypto.randomUUID(), ...record, syncRunId: run.id });
          if (record.normalizedData.title) {
            await kernel.submitCandidate({
              memoryType: 'FACT', subjectKey: `youtube.channel.${record.externalId}.title`,
              title: 'Authorized YouTube channel identity',
              content: `The authorized YouTube channel title is ${record.normalizedData.title}.`,
              source: record.sourceEndpoint,
              provenance: { sourceKind: 'AUTHORIZED_API', provider: 'youtube', externalId: record.externalId, syncRunId: run.id },
              sourceTimestamp: record.retrievedAt, verificationStatus: 'VERIFIED', confidence: 1,
              sensitivity: 'INTERNAL', retentionPolicy: 'STANDARD', sourceRecordRetained: true
            }, { isAuthorizedApi: true, actor: 'SYSTEM_AUTHORIZED_API' }, `${idempotencyKey}:memory:${record.externalId}`);
          }
        }
        if (!completedSteps.includes('NORMALIZE_AND_STORE')) completedSteps.push('NORMALIZE_AND_STORE');
        const finished = await repository.updateSyncRun(run.id, { status: 'SUCCEEDED', currentStep: 'COMPLETE', completedSteps, attemptCount });
        return { ...finished, recordsStored: records.length, sourceEndpoint: records[0]?.sourceEndpoint || null, idempotent: false };
      } catch (error) {
        const status = error.message === 'provider_disconnected' ? 'DISCONNECTED'
          : error.message === 'provider_reauthorization_required' ? 'REAUTHORIZATION_REQUIRED' : 'FAILED';
        const nextRetryAt = status === 'FAILED'
          ? new Date(Date.now() + Math.min(60 * 60 * 1000, 2 ** Math.min(attemptCount, 8) * 30_000)).toISOString()
          : null;
        const failed = await repository.updateSyncRun(run.id, {
          status, currentStep: 'FAILED', completedSteps, attemptCount,
          lastErrorCode: error.message, nextRetryAt
        });
        safeLogError('[INTEGRATION_SYNC_ERROR]', error, { provider, runId: run.id, attemptCount });
        return { ...failed, error: error.message };
      }
    },

    history(options) { return repository.listSyncRuns(options); },
    records(options) { return repository.listIntegrationRecords(options); }
  });
}

export const integrationSyncService = createIntegrationSyncService();
