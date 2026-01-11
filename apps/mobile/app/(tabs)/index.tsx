import { StatusBar } from "expo-status-bar";
import { useMemo, useCallback, useEffect } from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { FeedList } from "../../src/components/FeedList";
import { SessionRecap } from "../../src/components/SessionRecap";
import { useFeed } from "../../src/hooks/useFeed";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useSessionStore } from "../../src/stores/useSessionStore";
import { reviewCard, awardXp, likeCard, bookmarkCard } from "../../src/lib/api";

export default function HomeScreen() {
	const { t } = useTranslation();
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);

	const {
		stats,
		showRecap,
		sessionActive,
		startSession,
		recordCardView,
		recordRetained,
		recordForgot,
		addXp,
		continueSession,
		endSession,
	} = useSessionStore();

	useEffect(() => {
		if (!sessionActive) {
			startSession();
		}
	}, [sessionActive, startSession]);

	const { data, isLoading, refetch, isRefetching, loadMore, isFetchingNextPage, error } = useFeed();

	const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

	const handleReview = useCallback(
		async (cardId: string, rating: "forgot" | "retained") => {
			if (!token) return;
			try {
				const srsRating = rating === "retained" ? "GOOD" : "AGAIN";
				await reviewCard(cardId, srsRating, token);

				if (rating === "retained") {
					recordRetained(10);
				} else {
					recordForgot(2);
				}
			} catch (err) {
				console.error("Failed to submit review:", err);
			}
		},
		[token, recordRetained, recordForgot],
	);

	const handleQuizAnswer = useCallback(
		async (cardId: string, correct: boolean) => {
			if (!token) return;
			try {
				await awardXp(correct ? "QUIZ_SUCCESS" : "CARD_VIEW", cardId, token);

				if (correct) {
					addXp(25);
				}
			} catch (err) {
				console.error("Failed to submit quiz answer:", err);
			}
		},
		[token, addXp],
	);

	const handleLike = useCallback(
		async (cardId: string) => {
			if (!token) return;
			try {
				await likeCard(cardId, token);
			} catch (err) {
				console.error("Failed to toggle like:", err);
			}
		},
		[token],
	);

	const handleBookmark = useCallback(
		async (cardId: string) => {
			if (!token) return;
			try {
				await bookmarkCard(cardId, token);
			} catch (err) {
				console.error("Failed to toggle bookmark:", err);
			}
		},
		[token],
	);

	const handleCardView = useCallback(() => {
		recordCardView();
		addXp(5);
	}, [recordCardView, addXp]);

	const handleContinueSession = useCallback(() => {
		continueSession();
	}, [continueSession]);

	const handleFinishSession = useCallback(() => {
		endSession();
	}, [endSession]);

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
				<Text className="text-synap-pink text-lg font-semibold mb-2">{t("feed.error")}</Text>
				<Text className="text-text-secondary text-center mb-4">{(error as Error).message}</Text>
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
				onCardView={handleCardView}
			/>
			<StatusBar style="light" />

			{/* Session Recap Modal */}
			<SessionRecap
				visible={showRecap}
				stats={{
					...stats,
					streak: user?.streak ?? 0,
				}}
				onContinue={handleContinueSession}
				onFinish={handleFinishSession}
			/>
		</View>
	);
}

