import { FeedResponseDto } from '@memex/shared';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.replace(/\/+$/, '');
}

function guessLanHost(): string | null {
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.expoGoConfig?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri !== 'string' || hostUri.length === 0) return null;

  const host = hostUri.split(':')[0];
  return host.length > 0 ? host : null;
}

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL != null && process.env.EXPO_PUBLIC_API_URL.length > 0) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  const host = guessLanHost();
  if (host != null) {
    return `http://${host}:3000`;
  }

  return normalizeBaseUrl(
    Platform.select({
      ios: 'http://localhost:3000',
      android: 'http://10.0.2.2:3000',
      default: 'http://localhost:3000'
    }) as string
  );
}

export async function fetchFeed(cursor = 0, baseUrl = getApiBaseUrl()): Promise<FeedResponseDto> {
  const response = await fetch(`${baseUrl}/feed?cursor=${cursor}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error (${response.status}): ${message}`);
  }

  return (await response.json()) as FeedResponseDto;
}
