export default function handler(_request, response) {
  const lyraOnline = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY);
  const storageReady = Boolean(process.env.DATABASE_URL);

  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({
    status: 'ok',
    service: 'tactical-atlas-os',
    version: '4.6.0',
    lyra: lyraOnline ? 'online' : 'configuration_required',
    storage: storageReady ? 'online' : 'adapter_ready',
    governance: 'active',
    timestamp: new Date().toISOString(),
  });
}
