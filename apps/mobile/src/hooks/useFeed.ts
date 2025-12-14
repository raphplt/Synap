import { FeedResponseDto } from '@memex/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchFeed, getApiBaseUrl } from '../lib/api';

export function useFeed() {
  const baseUrl = getApiBaseUrl();

  const query = useInfiniteQuery<FeedResponseDto>({
    queryKey: ['feed'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => await fetchFeed((pageParam as number) ?? 0, baseUrl),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: 1
  });

  const loadMore = useCallback(() => {
    if (query.isFetchingNextPage || query.isLoading) return;
    if (query.hasNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  return {
    ...query,
    loadMore
  };
}
