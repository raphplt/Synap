import { FeedResponseDto } from '@memex/shared';
import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL != null && process.env.EXPO_PUBLIC_API_URL.length > 0) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return Platform.select({
    ios: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000',
    default: 'http://localhost:3000'
  }) as string;
}

export async function fetchFeed(cursor = 0, baseUrl = getApiBaseUrl()): Promise<FeedResponseDto> {
  const response = await fetch(`${baseUrl}/feed?cursor=${cursor}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error (${response.status}): ${message}`);
  }

  return (await response.json()) as FeedResponseDto;
}
