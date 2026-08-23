const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
export function getModelProviderStatus() {
  const configured = Boolean(process.env.ATLAS_AI_MODEL && (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN));
  return { provider: process.env.ATLAS_AI_PROVIDER || 'VERCEL_AI_GATEWAY', model: process.env.ATLAS_AI_MODEL ? 'CONFIGURED' : 'NOT_CONFIGURED', status: configured ? 'READY' : 'NOT_CONFIGURED' };
}
export async function generateModelResponse(messages) {
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const model = process.env.ATLAS_AI_MODEL;
  if (!token || !model) return { connected: false, status: 'NOT_CONFIGURED', reply: null };
  const response = await fetch(GATEWAY_URL, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 700 }) });
  const data = await response.json().catch(() => ({}));
  return response.ok ? { connected: true, status: 'VERIFIED', reply: data?.choices?.[0]?.message?.content || null } : { connected: false, status: 'ERROR', reply: null };
}
