const ready = (value) => ['READY', 'CONFIGURED', 'IMMUTABLE_HASH_CHAIN_CONFIGURED'].includes(value);

export function getGuardianReadiness(snapshot) {
  if (!snapshot) {
    return {
      status: 'CHECKING',
      fullyActive: false,
      protectiveMode: true,
      checks: [{ label: 'Security snapshot', value: 'CHECKING', ready: false }],
    };
  }

  const commander = snapshot.components?.COMMANDER_AUTH?.status || 'NOT_CONFIGURED';
  const rateLimiter = snapshot.security?.rateLimiter?.status || 'NOT_CONFIGURED';
  const auditLog = snapshot.security?.auditLog || 'NOT_CONFIGURED';
  const executionMode = snapshot.executionMode || 'READ_ONLY';
  const checks = [
    {
      label: 'Same-origin API boundary',
      value: snapshot.security?.cors || 'UNKNOWN',
      ready: snapshot.security?.cors === 'SAME_ORIGIN',
    },
    { label: 'Commander session', value: commander, ready: ready(commander) },
    {
      label: 'Human approval gates',
      value: snapshot.components?.APPROVAL_QUEUE?.status || 'NOT_CONFIGURED',
      ready: ready(snapshot.components?.APPROVAL_QUEUE?.status),
    },
    { label: 'Immutable audit trail', value: auditLog, ready: ready(auditLog) },
    { label: 'Rate limiter', value: rateLimiter, ready: ready(rateLimiter) },
  ];
  const fullyActive = checks.every((check) => check.ready);

  return {
    status: fullyActive
      ? 'ACTIVE'
      : executionMode === 'READ_ONLY'
        ? 'PROTECTIVE READ-ONLY'
        : 'DEGRADED',
    fullyActive,
    protectiveMode: !fullyActive && executionMode === 'READ_ONLY',
    checks,
  };
}
