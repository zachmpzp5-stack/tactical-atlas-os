export async function executeReadOnlyTool(toolName, params = {}) {
  switch (toolName) {
    case 'getSystemStatus':
      return {
        connected: false,
        status: 'UNVERIFIED',
        message: 'Live Atlas system telemetry is not connected yet.',
        lastCheck: new Date().toISOString()
      };

    case 'getMissionStatus':
      return {
        connected: false,
        activeMissions: [],
        pendingApprovals: null,
        message: 'Mission data source is not connected yet.'
      };

    case 'searchTAIN':
      return {
        connected: false,
        query: params.query || '',
        results: [],
        message: 'TAIN retrieval adapter is not connected yet.'
      };

    case 'getHeadquartersStatus':
      return {
        connected: false,
        environment: 'TACTICAL ATLAS COMMAND OS',
        operationalState: 'UNVERIFIED',
        message: 'Live Headquarters telemetry is not connected yet.'
      };

    case 'getRecentActivity':
      return {
        connected: false,
        activities: [],
        count: 0,
        message: 'Recent activity source is not connected yet.'
      };

    default:
      throw new Error('Unauthorized or unknown read-only tool.');
  }
}
