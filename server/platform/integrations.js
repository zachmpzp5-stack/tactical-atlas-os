export const ACCOUNT_STATES = Object.freeze({
  KEYS_REQUIRED: 'KEYS_REQUIRED',
  READY_TO_LINK: 'READY_TO_LINK',
  LINKED: 'LINKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REAUTHORIZATION_REQUIRED: 'REAUTHORIZATION_REQUIRED',
  PARTNER_REQUIRED: 'PARTNER_REQUIRED',
  ERROR: 'ERROR'
});

export const PROVIDERS = Object.freeze({
  twitch: {
    label: 'Twitch', category: 'Streaming', clientId: 'TWITCH_CLIENT_ID', clientSecret: 'TWITCH_CLIENT_SECRET',
    authorizeUrl: 'https://id.twitch.tv/oauth2/authorize', tokenUrl: 'https://id.twitch.tv/oauth2/token', scopes: [], pkce: false
  },
  youtube: {
    label: 'YouTube / Google', category: 'Streaming', clientId: 'GOOGLE_CLIENT_ID', clientSecret: 'GOOGLE_CLIENT_SECRET',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'profile', 'https://www.googleapis.com/auth/youtube.readonly'], pkce: true, portalApproval: true, extraAuthorize: { access_type: 'offline', prompt: 'consent' }
  },
  tiktok: {
    label: 'TikTok', category: 'Social', clientId: 'TIKTOK_CLIENT_KEY', clientSecret: 'TIKTOK_CLIENT_SECRET',
    authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/', tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic'], pkce: false, clientIdParam: 'client_key', portalApproval: true
  },
  discord: {
    label: 'Discord', category: 'Community', clientId: 'DISCORD_CLIENT_ID', clientSecret: 'DISCORD_CLIENT_SECRET',
    authorizeUrl: 'https://discord.com/oauth2/authorize', tokenUrl: 'https://discord.com/api/oauth2/token', scopes: ['identify'], pkce: false, pkceFlag: 'DISCORD_OAUTH_PKCE_ENABLED'
  },
  microsoft: {
    label: 'Microsoft / Xbox identity', category: 'Gaming / Identity', clientId: 'MICROSOFT_CLIENT_ID', clientSecret: 'MICROSOFT_CLIENT_SECRET',
    authorizeUrl: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
    scopes: ['openid', 'profile', 'offline_access', 'User.Read'], pkce: true
  },
  x: {
    label: 'X', category: 'Social', clientId: 'X_CLIENT_ID', clientSecret: 'X_CLIENT_SECRET',
    authorizeUrl: 'https://x.com/i/oauth2/authorize', tokenUrl: 'https://api.x.com/2/oauth2/token', scopes: ['users.read', 'offline.access'], pkce: true, basicAuth: true
  },
  linkedin: {
    label: 'LinkedIn', category: 'Professional', clientId: 'LINKEDIN_CLIENT_ID', clientSecret: 'LINKEDIN_CLIENT_SECRET',
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization', tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['openid', 'profile'], pkce: false, portalApproval: true
  },
  facebook: {
    label: 'Facebook', category: 'Social', clientId: 'FACEBOOK_APP_ID', clientSecret: 'FACEBOOK_APP_SECRET', productFlag: 'META_FACEBOOK_LOGIN_ENABLED',
    authorizeUrl: 'https://www.facebook.com/dialog/oauth', tokenUrl: 'https://graph.facebook.com/oauth/access_token',
    scopes: ['public_profile'], pkce: false, portalApproval: true
  },
  instagram: {
    label: 'Instagram', category: 'Social', clientId: 'INSTAGRAM_APP_ID', clientSecret: 'INSTAGRAM_APP_SECRET', productFlag: 'META_INSTAGRAM_LOGIN_ENABLED',
    authorizeUrl: 'https://www.instagram.com/oauth/authorize', tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: ['instagram_business_basic'], pkce: false, portalApproval: true
  },
  steam: {
    label: 'Steam', category: 'Gaming', openId: true, authorizeUrl: 'https://steamcommunity.com/openid/login', scopes: [], pkce: false
  },
  playstation: { label: 'PlayStation', category: 'Gaming', partnerRequired: true, scopes: [], pkce: false }
});

export function getProvider(providerId) {
  return PROVIDERS[String(providerId || '').toLowerCase()] || null;
}

export function providerUsesPkce(provider) {
  return Boolean(provider?.pkce || (provider?.pkceFlag && process.env[provider.pkceFlag] === '1'));
}

export function getProviderReadiness(providerId) {
  const provider = getProvider(providerId);
  if (!provider) return ACCOUNT_STATES.ERROR;
  if (provider.partnerRequired) return ACCOUNT_STATES.PARTNER_REQUIRED;
  if (provider.openId) return process.env.ATLAS_PUBLIC_URL && process.env.ATLAS_TOKEN_ENCRYPTION_KEY ? ACCOUNT_STATES.READY_TO_LINK : ACCOUNT_STATES.KEYS_REQUIRED;
  if (!process.env[provider.clientId] || !process.env[provider.clientSecret]) return ACCOUNT_STATES.KEYS_REQUIRED;
  if (provider.productFlag && process.env[provider.productFlag] !== '1') return ACCOUNT_STATES.PARTNER_REQUIRED;
  if (!process.env.ATLAS_PUBLIC_URL || !process.env.ATLAS_TOKEN_ENCRYPTION_KEY) return ACCOUNT_STATES.KEYS_REQUIRED;
  return ACCOUNT_STATES.READY_TO_LINK;
}

export function getIntegrationStatuses() {
  return Object.fromEntries(Object.entries(PROVIDERS).map(([id, provider]) => {
    const status = getProviderReadiness(id);
    return [id, {
      label: provider.label,
      category: provider.category,
      status,
      connectable: status === ACCOUNT_STATES.READY_TO_LINK,
      portalApproval: Boolean(provider.portalApproval),
      callbackPath: provider.partnerRequired ? null : `/api/accounts/${id}/callback`
    }];
  }));
}
