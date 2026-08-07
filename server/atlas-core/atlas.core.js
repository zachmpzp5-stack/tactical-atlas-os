export const ATLAS_CORE = Object.freeze({
  name: 'ATLAS CORE',
  version: '1.0.0',
  codename: 'Aegis',
  status: 'ONLINE'
});

const ROUTES = Object.freeze({
  SYSTEM: 'SYSTEM_INTELLIGENCE',
  MISSION: 'MISSION_INTELLIGENCE',
  TAIN: 'TAIN_RETRIEVAL',
  ANALYSIS: 'GENERAL_ANALYSIS'
});

function classifyIntent(message = '') {
  const text = String(message).toLowerCase();

  if (
    text.includes('system') ||
    text.includes('status') ||
    text.includes('headquarters')
  ) {
    return ROUTES.SYSTEM;
  }

  if (
    text.includes('mission') ||
    text.includes('objective') ||
    text.includes('operation')
  ) {
    return ROUTES.MISSION;
  }

  if (
    text.includes('tain') ||
    text.includes('archive') ||
    text.includes('memory') ||
    text.includes('record')
  ) {
    return ROUTES.TAIN;
  }

  return ROUTES.ANALYSIS;
}

export function runAtlasCore({
  message = '',
  identity = {},
  toolData = null
} = {}) {
  const intent = classifyIntent(message);

  return {
    core: ATLAS_CORE.name,
    version: ATLAS_CORE.version,
    status: ATLAS_CORE.status,

    identity: {
      profile: identity.profile || 'LYRA_STANDARD',
      clearance: identity.clearance || 'STANDARD',
      isCommander: Boolean(identity.isCommander)
    },

    decision: {
      intent,
      access:
        identity.isCommander
          ? 'COMMANDER'
          : 'STANDARD',
      executionMode: 'READ_ONLY'
    },

    context: {
      message,
      toolData
    },

    timestamp: new Date().toISOString()
  };
}