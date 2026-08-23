import { ACCOUNT_STATES, PROVIDERS, getProvider, getProviderReadiness, providerUsesPkce } from '../platform/integrations.js';
import { createOAuthState, consumeOAuthState } from './oauth-state.js';
import { buildAuthorizationUrl, callbackUrl, exchangeAuthorizationCode, revokeProviderToken, verifySteamCallback } from './providers.js';
import { deleteSecureRecord, getSecureRecord, getStorageStatus, setSecureRecord } from './storage.js';

const linkKey = (provider) => `atlas:account-link:${provider}`;

function ensureReady(providerId) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error('unknown_provider');
  const readiness = getProviderReadiness(providerId);
  if (readiness !== ACCOUNT_STATES.READY_TO_LINK) throw new Error(readiness.toLowerCase());
  if (!getStorageStatus().available) throw new Error('token_storage_unavailable');
  return provider;
}

export async function startAccountLink(providerId, sessionBinding) {
  const provider = ensureReady(providerId);
  const transaction = await createOAuthState(providerId, sessionBinding, providerUsesPkce(provider));
  return buildAuthorizationUrl(providerId, transaction);
}

export async function completeAccountLink(providerId, query, sessionBinding) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error('unknown_provider');
  const transaction = await consumeOAuthState(query.state, providerId, sessionBinding);
  ensureReady(providerId);
  if (query.error) throw new Error('provider_authorization_denied');
  let record;
  if (provider.openId) {
    record = await verifySteamCallback(query, `${callbackUrl(providerId)}?state=${encodeURIComponent(query.state)}`);
  } else {
    if (!query.code) throw new Error('authorization_code_missing');
    record = await exchangeAuthorizationCode(providerId, query.code, transaction.verifier);
  }
  await setSecureRecord(linkKey(providerId), { ...record, provider: providerId });
}

export async function getAccountStatuses() {
  const storage = getStorageStatus();
  const entries = await Promise.all(Object.entries(PROVIDERS).map(async ([id, provider]) => {
    const readiness = getProviderReadiness(id);
    let status = readiness;
    if (readiness === ACCOUNT_STATES.READY_TO_LINK) {
      if (!storage.available) status = ACCOUNT_STATES.ERROR;
      else {
        try {
          const record = await getSecureRecord(linkKey(id));
          if (record) {
            if (record.error) status = ACCOUNT_STATES.ERROR;
            else if (record.expiresAt && record.expiresAt <= Date.now()) status = record.refreshToken ? ACCOUNT_STATES.TOKEN_EXPIRED : ACCOUNT_STATES.REAUTHORIZATION_REQUIRED;
            else status = ACCOUNT_STATES.LINKED;
          }
        } catch { status = ACCOUNT_STATES.ERROR; }
      }
    }
    return [id, {
      label: provider.label, category: provider.category, status,
      connectable: status === ACCOUNT_STATES.READY_TO_LINK || status === ACCOUNT_STATES.LINKED || status === ACCOUNT_STATES.TOKEN_EXPIRED || status === ACCOUNT_STATES.REAUTHORIZATION_REQUIRED,
      disconnectable: status === ACCOUNT_STATES.LINKED || status === ACCOUNT_STATES.TOKEN_EXPIRED || status === ACCOUNT_STATES.REAUTHORIZATION_REQUIRED,
      portalApproval: Boolean(provider.portalApproval), callbackPath: provider.partnerRequired ? null : `/api/accounts/${id}/callback`
    }];
  }));
  return {
    executionMode: 'READ_ONLY', storage: storage.backend,
    source: 'ENCRYPTED_SERVER_TOKEN_STORE', freshness: new Date().toISOString(),
    providers: Object.fromEntries(entries)
  };
}

export async function disconnectAccount(providerId) {
  const provider = getProvider(providerId);
  if (!provider || provider.partnerRequired) throw new Error('provider_unavailable');
  const record = await getSecureRecord(linkKey(providerId));
  let revocation = { attempted: false };
  if (record) {
    try { revocation = await revokeProviderToken(providerId, record); }
    catch { revocation = { attempted: true, succeeded: false }; }
  }
  await deleteSecureRecord(linkKey(providerId));
  return revocation;
}

export async function getLinkedAccountRecord(providerId) {
  const provider = getProvider(providerId);
  if (!provider || provider.partnerRequired) throw new Error('provider_unavailable');
  return getSecureRecord(linkKey(providerId));
}

export async function setLinkedAccountRecord(providerId, record) {
  const provider = getProvider(providerId);
  if (!provider || provider.partnerRequired) throw new Error('provider_unavailable');
  return setSecureRecord(linkKey(providerId), { ...record, provider: providerId });
}
