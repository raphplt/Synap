import { FeedResponseDto } from "@synap/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { fetchFeed, getApiBaseUrl, ingestRandomWiki } from "../lib/api";

export function useFeed() {
	const baseUrl = getApiBaseUrl();
	const hasKickedRef = useRef(false);

	const query = useInfiniteQuery<FeedResponseDto>({
		queryKey: ["feed", baseUrl],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) =>
			await fetchFeed((pageParam as number) ?? 0, baseUrl),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		refetchInterval: (q) => {
			if (q.state.status !== "success") return false;
			const firstCount = q.state.data?.pages?.[0]?.items?.length ?? 0;
			return firstCount === 0 ? 2000 : false;
		},
		retry: 1,
	});

	useEffect(() => {
		const firstCount = query.data?.pages?.[0]?.items?.length ?? 0;
		if (query.status !== "success") return;

		if (!hasKickedRef.current && firstCount < 10) {
			hasKickedRef.current = true;
			ingestRandomWiki(50, baseUrl)
				.then(async () => {
					await query.refetch();
				})
				.catch(() => {
					hasKickedRef.current = false;
				});
		}
	}, [baseUrl, query.data?.pages, query.status]);

	const loadMore = useCallback(() => {
		if (query.isFetchingNextPage || query.isLoading) return;
		if (query.hasNextPage) {
			void query.fetchNextPage();
		}
	}, [query]);

	return {
		...query,
		loadMore,
	};
}
