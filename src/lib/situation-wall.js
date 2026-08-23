export const TAAN_NODES = Object.freeze([
  { id: 'HOTEL', role: 'Research + Innovation' },
  { id: 'ORBIT', role: 'Digital Operations' },
  { id: 'LEGION', role: 'Security + Defense' },
  { id: 'INSPECTOR', role: 'Verification + Quality' },
  { id: 'ACADEMY', role: 'Training + Doctrine' },
  { id: 'COMMS', role: 'Media + Messaging' },
  { id: 'ARCHIVES', role: 'Knowledge + Memory' },
  { id: 'PMO', role: 'Mission Control' },
  { id: 'ATELIER', role: 'Design + Brand' },
]);

const LOCATION_INTELLIGENCE = Object.freeze({
  EL_DORADO: {
    threat: 'LOW',
    node: 'COMMS',
    signal: 98,
    note: 'Publishing route secured; monitoring public-release integrity.',
  },
  OAK_ISLAND: {
    threat: 'GUARDED',
    node: 'INSPECTOR',
    signal: 91,
    note: 'Script claims remain under source and provenance review.',
  },
  HIGHJUMP: {
    threat: 'HIGH',
    node: 'LEGION',
    signal: 72,
    note: 'Conflicting archival records and restricted-region claims require caution.',
  },
  ATLANTIS: {
    threat: 'ELEVATED',
    node: 'HOTEL',
    signal: 84,
    note: 'Multiple location hypotheses remain unresolved.',
  },
  GOBEKLI: {
    threat: 'LOW',
    node: 'ACADEMY',
    signal: 96,
    note: 'Primary archaeological record is stable and well sourced.',
  },
  DEAD_SEA_SCROLLS: {
    threat: 'GUARDED',
    node: 'ARCHIVES',
    signal: 94,
    note: 'Translation variants require explicit source attribution.',
  },
  PIRI_REIS: {
    threat: 'GUARDED',
    node: 'ORBIT',
    signal: 88,
    note: 'Cartographic interpretation is disputed; imagery comparison is active.',
  },
  COPPER_SCROLL: {
    threat: 'ELEVATED',
    node: 'INSPECTOR',
    signal: 82,
    note: 'Treasure-location claims need independent verification.',
  },
  ALEXANDRIA: {
    threat: 'LOW',
    node: 'ARCHIVES',
    signal: 95,
    note: 'Archive reconstruction is proceeding with source separation intact.',
  },
  DERINKUYU: {
    threat: 'ELEVATED',
    node: 'HOTEL',
    signal: 79,
    note: 'Subterranean-site assertions include unresolved extrapolations.',
  },
  ADMIRAL_BYRD: {
    threat: 'GUARDED',
    node: 'PMO',
    signal: 86,
    note: 'Diary provenance and later retellings are tracked separately.',
  },
  WOOLPIT: {
    threat: 'HIGH',
    node: 'COMMS',
    signal: 68,
    note: 'Folklore transmission creates a high distortion risk.',
  },
});

export const THREAT_LEVELS = Object.freeze(['HIGH', 'ELEVATED', 'GUARDED', 'LOW']);

export function getSituationIntelligence(location) {
  if (!location) {
    return { threat: 'GUARDED', node: 'PMO', signal: 0, note: 'No location selected.' };
  }

  return (
    LOCATION_INTELLIGENCE[location.id] || {
      threat: location.progress < 40 ? 'ELEVATED' : 'GUARDED',
      node: 'PMO',
      signal: Math.max(50, Math.min(99, Number(location.progress) || 50)),
      note: 'Awaiting a dedicated intelligence assessment.',
    }
  );
}

export function summarizeThreats(locations = []) {
  const counts = Object.fromEntries(THREAT_LEVELS.map((level) => [level, 0]));
  locations.forEach((location) => {
    const { threat } = getSituationIntelligence(location);
    counts[threat] = (counts[threat] || 0) + 1;
  });
  return counts;
}

export function buildNodeFeed(statuses = {}) {
  return TAAN_NODES.map((node) => ({
    ...node,
    status: typeof statuses[node.id] === 'string' ? statuses[node.id] : 'READY',
  }));
}
