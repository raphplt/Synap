import { FeedResponseDto } from '@memex/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchFeed, getApiBaseUrl } from '../lib/api';

export function useFeed() {
  const baseUrl = getApiBaseUrl();

  const query = useInfiniteQuery<FeedResponseDto>({
    queryKey: ['feed', baseUrl],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => await fetchFeed((pageParam as number) ?? 0, baseUrl),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: (q) => {
      if (q.state.status !== 'success') return false;
      const firstCount = q.state.data?.pages?.[0]?.items?.length ?? 0;
      return firstCount === 0 ? 2000 : false;
    },
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
