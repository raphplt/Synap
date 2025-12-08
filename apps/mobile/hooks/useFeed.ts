import { useInfiniteQuery } from '@tanstack/react-query';
import { IFeedResponse, ICard } from '@memex/shared';

// Mock fetch function - replace with actual API call
const fetchFeed = async ({ pageParam = 0 }): Promise<IFeedResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
        data: Array.from({ length: 5 }).map((_, i) => ({
            id: Math.random().toString(),
            title: `Lesson #${pageParam + i + 1}`,
            summary: 'Swipe to see more amazing educational content.',
            content: '# Learning is fun\n\nThis is the markdown content for this card.\n\n- Point 1\n- Point 2',
            type: Math.random() > 0.8 ? 'QUIZ' : 'LEARN',
            category: 'Demo',
            difficultyLevel: Math.floor(Math.random() * 5) + 1,
            mediaUrl: `https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
            tags: ['demo', 'react-native'],
        } as ICard)),
        take: 10,
        skip: pageParam + 10,
        total: 100
    };
};

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.skip < (lastPage.total || 100) ? lastPage.skip : undefined,
  });
};
