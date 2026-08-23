import { getDatabaseStatus } from '../data/database.js';
import { memoryKernel } from './memory.kernel.js';

export function getTainHealth() {
  const database = getDatabaseStatus();
  return {
    component: 'TAIN',
    status: database.configured ? 'CONFIGURED_UNVERIFIED' : 'NOT_CONFIGURED',
    persistence: database.configured ? 'NEON_POSTGRES' : null,
    recordSource: database.configured ? 'PERSISTENT_SOURCE_BACKED_MEMORY' : null,
    learningMode: 'GOVERNED_RETRIEVAL_ONLY',
    executionMode: 'READ_ONLY'
  };
}

export async function retrieveTain(query, options) {
  if (!getDatabaseStatus().configured) {
    return { ...getTainHealth(), query: String(query || '').trim(), results: [], warnings: [{ code: 'DATABASE_NOT_CONFIGURED' }] };
  }
  return memoryKernel.retrieve(query, options);
}
