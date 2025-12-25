import { StatusBar } from "expo-status-bar";
import { useMemo, useCallback } from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { FeedList } from "../../src/components/FeedList";
import { useFeed } from "../../src/hooks/useFeed";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { reviewCard, awardXp } from "../../src/lib/api";

export default function HomeScreen() {
	const { t } = useTranslation();
	const token = useAuthStore((state) => state.token);

	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		loadMore,
		isFetchingNextPage,
		error,
	} = useFeed();

	const items = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data?.pages]
	);

	// Handle review feedback (for review cards)
	const handleReview = useCallback(
		async (cardId: string, rating: "forgot" | "retained") => {
			if (!token) return;
			try {
				const srsRating = rating === "retained" ? "GOOD" : "AGAIN";
				await reviewCard(cardId, srsRating, token);
			} catch (err) {
				console.error("Failed to submit review:", err);
			}
		},
		[token]
	);

	// Handle quiz answers
	const handleQuizAnswer = useCallback(
		async (cardId: string, correct: boolean) => {
			if (!token) return;
			try {
				// Award XP for quiz
				await awardXp(correct ? "QUIZ_SUCCESS" : "CARD_VIEW", cardId, token);
			} catch (err) {
				console.error("Failed to submit quiz answer:", err);
			}
		},
		[token]
	);

	const handleLike = useCallback((cardId: string) => {
		// TODO: Implement like API
		console.log("Liked card:", cardId);
	}, []);

	const handleBookmark = useCallback((cardId: string) => {
		// TODO: Implement bookmark API
		console.log("Bookmarked card:", cardId);
	}, []);

	if (isLoading) {
		return (
			<View
				style={{ flex: 1, backgroundColor: "#073B4C" }}
				className="flex-1 items-center justify-center"
			>
				<ActivityIndicator color="#06D6A0" size="large" />
				<Text className="text-text-secondary mt-3">{t("feed.loading")}</Text>
			</View>
		);
	}

	if (error != null) {
		return (
			<View
				className="flex-1 items-center justify-center px-6"
				style={{ backgroundColor: "#073B4C" }}
			>
				<Text className="text-synap-pink text-lg font-semibold mb-2">
					{t("feed.error")}
				</Text>
				<Text className="text-text-secondary text-center mb-4">
					{(error as Error).message}
				</Text>
				<Pressable onPress={() => refetch()}>
					<Text className="text-synap-emerald underline">{t("common.retry")}</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: "#073B4C" }}>
			<FeedList
				items={items}
				onEndReached={loadMore}
				refreshing={isRefetching}
				onRefresh={() => refetch()}
				isFetchingNextPage={isFetchingNextPage}
				onReview={handleReview}
				onQuizAnswer={handleQuizAnswer}
				onLike={handleLike}
				onBookmark={handleBookmark}
			/>
			<StatusBar style="light" />
		</View>
	);
}
