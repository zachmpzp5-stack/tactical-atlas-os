const SERVICES = Object.freeze({
  DATABASE: ['DATABASE_URL'], RATE_LIMITER: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'], OBJECT_STORAGE: ['OBJECT_STORAGE_URL', 'OBJECT_STORAGE_TOKEN'],
  QUEUE: ['QUEUE_URL', 'QUEUE_TOKEN'], OBSERVABILITY: ['OTEL_EXPORTER_OTLP_ENDPOINT']
});
export function getCloudInfrastructureStatus() {
  const services = Object.fromEntries(Object.entries(SERVICES).map(([name, variables]) => [name, {
    status: variables.every((key) => Boolean(process.env[key])) ? 'CONFIGURED_UNVERIFIED' : 'NOT_CONFIGURED',
    source: 'SERVER_ENVIRONMENT'
  }]));
  return { provider: process.env.ATLAS_CLOUD_PROVIDER || 'VERCEL_SERVERLESS', runtime: process.env.VERCEL ? 'VERIFIED' : 'UNVERIFIED', region: process.env.VERCEL_REGION ? 'CONFIGURED' : 'UNVERIFIED', services };
}
