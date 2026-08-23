import { getLinkedAccountRecord, setLinkedAccountRecord } from '../accounts/service.js';
import { refreshProviderToken } from '../accounts/providers.js';

export const YOUTUBE_CHANNELS_ENDPOINT = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&maxResults=50';

export async function getYouTubeAccessToken() {
  let record = await getLinkedAccountRecord('youtube');
  if (!record) throw new Error('provider_disconnected');
  if (record.expiresAt && record.expiresAt <= Date.now() + 30_000) {
    if (!record.refreshToken) throw new Error('provider_reauthorization_required');
    record = await refreshProviderToken('youtube', record);
    await setLinkedAccountRecord('youtube', record);
  }
  return record.accessToken;
}

export async function fetchYouTubeChannels(accessToken) {
  const response = await fetch(YOUTUBE_CHANNELS_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  });
  if (response.status === 401) throw new Error('provider_reauthorization_required');
  if (!response.ok) throw new Error('youtube_read_failed');
  const body = await response.json();
  const retrievedAt = new Date().toISOString();
  return (Array.isArray(body.items) ? body.items : []).map((channel) => ({
    provider: 'youtube', externalId: String(channel.id), recordType: 'CHANNEL', retrievedAt,
    sourceEndpoint: YOUTUBE_CHANNELS_ENDPOINT, syncStatus: 'VERIFIED_READ',
    normalizedData: {
      title: channel.snippet?.title || null,
      customUrl: channel.snippet?.customUrl || null,
      publishedAt: channel.snippet?.publishedAt || null,
      country: channel.snippet?.country || null,
      thumbnailUrl: channel.snippet?.thumbnails?.default?.url || null
    }
  }));
}
