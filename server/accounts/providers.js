import { getProvider } from '../platform/integrations.js';

export function requirePublicUrl() {
  const raw = String(process.env.ATLAS_PUBLIC_URL || '').trim();
  let url;
  try { url = new URL(raw); } catch { throw new Error('atlas_public_url_required'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('atlas_public_url_invalid');
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('atlas_public_url_must_be_https');
  return url.toString().replace(/\/$/, '');
}

export function callbackUrl(providerId) {
  return `${requirePublicUrl()}/api/accounts/${providerId}/callback`;
}

export function buildAuthorizationUrl(providerId, transaction) {
  const provider = getProvider(providerId);
  if (!provider || provider.partnerRequired) throw new Error('provider_unavailable');
  const redirectUri = callbackUrl(providerId);
  if (provider.openId) {
    const url = new URL(provider.authorizeUrl);
    const returnTo = `${redirectUri}?state=${encodeURIComponent(transaction.state)}`;
    url.search = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0', 'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo, 'openid.realm': `${new URL(requirePublicUrl()).origin}/`,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });
    return url.toString();
  }
  const url = new URL(provider.authorizeUrl);
  const params = {
    response_type: 'code', [provider.clientIdParam || 'client_id']: process.env[provider.clientId], redirect_uri: redirectUri,
    scope: provider.scopes.join(providerId === 'tiktok' ? ',' : ' '), state: transaction.state,
    ...(provider.extraAuthorize || {})
  };
  if (transaction.challenge) Object.assign(params, { code_challenge: transaction.challenge, code_challenge_method: 'S256' });
  url.search = new URLSearchParams(params);
  return url.toString();
}

async function parseTokenResponse(response) {
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = Object.fromEntries(new URLSearchParams(text)); }
  if (!response.ok || !body.access_token) throw new Error('provider_token_exchange_failed');
  return body;
}

function tokenRequest(providerId, provider, params) {
  const clientId = process.env[provider.clientId];
  const clientSecret = process.env[provider.clientSecret];
  if (providerId === 'tiktok') params.set('client_key', clientId); else params.set('client_id', clientId);
  if (!provider.basicAuth) params.set('client_secret', clientSecret);
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' };
  if (provider.basicAuth) headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  return { headers, body: params };
}

async function fetchProviderIdentity(providerId, accessToken) {
  const endpoints = {
    twitch: 'https://api.twitch.tv/helix/users',
    youtube: 'https://www.googleapis.com/oauth2/v3/userinfo',
    tiktok: 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
    discord: 'https://discord.com/api/users/@me',
    microsoft: 'https://graph.microsoft.com/v1.0/me?$select=id,displayName',
    x: 'https://api.x.com/2/users/me',
    linkedin: 'https://api.linkedin.com/v2/userinfo',
    facebook: 'https://graph.facebook.com/me?fields=id',
    instagram: 'https://graph.instagram.com/me?fields=user_id,username'
  };
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
  if (providerId === 'twitch') headers['Client-Id'] = process.env.TWITCH_CLIENT_ID;
  const response = await fetch(endpoints[providerId], { headers });
  if (!response.ok) throw new Error('provider_identity_verification_failed');
  const body = await response.json();
  const identity = providerId === 'twitch' ? body.data?.[0]?.id
    : providerId === 'tiktok' ? body.data?.user?.open_id
      : providerId === 'x' ? body.data?.id
        : body.sub || body.id || body.user_id;
  if (!identity) throw new Error('provider_identity_verification_failed');
  return String(identity);
}

export async function exchangeAuthorizationCode(providerId, code, verifier) {
  const provider = getProvider(providerId);
  const redirectUri = callbackUrl(providerId);
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
  if (verifier) body.set('code_verifier', verifier);
  const request = tokenRequest(providerId, provider, body);
  const tokens = await parseTokenResponse(await fetch(provider.tokenUrl, { method: 'POST', ...request }));
  const record = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    tokenType: tokens.token_type || 'Bearer',
    scope: tokens.scope || provider.scopes.join(' '),
    providerAccountId: tokens.open_id || tokens.user_id || null,
    expiresAt: tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : null,
    refreshExpiresAt: tokens.refresh_expires_in ? Date.now() + Number(tokens.refresh_expires_in) * 1000 : null,
    linkedAt: Date.now()
  };
  try {
    record.providerAccountId = record.providerAccountId || await fetchProviderIdentity(providerId, record.accessToken);
  } catch (error) {
    try { await revokeProviderToken(providerId, record); } catch { /* best-effort cleanup */ }
    throw error;
  }
  return record;
}

export async function refreshProviderToken(providerId, record) {
  const provider = getProvider(providerId);
  if (!provider || !record?.refreshToken) throw new Error('provider_reauthorization_required');
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: record.refreshToken });
  const tokens = await parseTokenResponse(await fetch(provider.tokenUrl, { method: 'POST', ...tokenRequest(providerId, provider, body) }));
  return {
    ...record,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || record.refreshToken,
    tokenType: tokens.token_type || record.tokenType || 'Bearer',
    scope: tokens.scope || record.scope,
    expiresAt: tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : record.expiresAt,
    refreshExpiresAt: tokens.refresh_expires_in ? Date.now() + Number(tokens.refresh_expires_in) * 1000 : record.refreshExpiresAt,
    refreshedAt: Date.now()
  };
}

export async function verifySteamCallback(query, expectedReturnUrl) {
  if (query['openid.mode'] !== 'id_res') throw new Error('steam_openid_rejected');
  if (query['openid.return_to'] !== expectedReturnUrl) throw new Error('unsafe_redirect_rejected');
  const claimedId = String(query['openid.claimed_id'] || '');
  const match = claimedId.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
  if (!match) throw new Error('steam_identity_invalid');
  const verification = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (key.startsWith('openid.')) verification.set(key, value);
  verification.set('openid.mode', 'check_authentication');
  const response = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: verification
  });
  if (!response.ok || !(await response.text()).includes('is_valid:true')) throw new Error('steam_openid_verification_failed');
  return { providerAccountId: match[1], linkedAt: Date.now(), expiresAt: null, scope: 'openid.identity' };
}

export async function revokeProviderToken(providerId, record) {
  if (!record?.accessToken) return { attempted: false };
  const provider = getProvider(providerId);
  const token = record.accessToken;
  let request = null;
  if (providerId === 'twitch') request = ['https://id.twitch.tv/oauth2/revoke', { client_id: process.env[provider.clientId], token }];
  if (providerId === 'youtube') request = ['https://oauth2.googleapis.com/revoke', { token }];
  if (providerId === 'tiktok') request = ['https://open.tiktokapis.com/v2/oauth/revoke/', { client_key: process.env[provider.clientId], client_secret: process.env[provider.clientSecret], token }];
  if (providerId === 'discord') request = ['https://discord.com/api/oauth2/token/revoke', { token, client_id: process.env[provider.clientId], client_secret: process.env[provider.clientSecret] }];
  if (providerId === 'facebook') request = ['https://graph.facebook.com/me/permissions', { access_token: token }, 'DELETE'];
  if (providerId === 'x') {
    const credentials = Buffer.from(`${process.env[provider.clientId]}:${process.env[provider.clientSecret]}`).toString('base64');
    const response = await fetch('https://api.x.com/2/oauth2/revoke', {
      method: 'POST', headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token, token_type_hint: 'access_token' })
    });
    return { attempted: true, succeeded: response.ok };
  }
  if (!request) return { attempted: false };
  const [url, params, method = 'POST'] = request;
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  return { attempted: true, succeeded: response.ok };
}
