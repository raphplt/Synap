import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useCallback } from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { FeedList } from "../../src/components/FeedList";
import { useFeed } from "../../src/hooks/useFeed";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { reviewCard, SrsRating } from "../../src/lib/api";

export default function HomeScreen() {
	const { t } = useTranslation();
	const token = useAuthStore((state) => state.token);
	const [showSrsOverlay, setShowSrsOverlay] = useState(false);
	const [currentCardId, setCurrentCardId] = useState<string | null>(null);

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

	const handleCardFlip = useCallback((cardId: string) => {
		setCurrentCardId(cardId);
		setShowSrsOverlay(true);
	}, []);

	const handleCardLike = useCallback((cardId: string) => {
		// TODO: Implement like API
		console.log("Liked card:", cardId);
	}, []);

	const handleSrsResponse = useCallback(
		async (rating: SrsRating) => {
			if (currentCardId && token) {
				try {
					await reviewCard(currentCardId, rating, token);
				} catch (err) {
					console.error("Failed to submit review:", err);
				}
			}
			setShowSrsOverlay(false);
			setCurrentCardId(null);
		},
		[currentCardId, token]
	);

	const dismissSrsOverlay = useCallback(() => {
		setShowSrsOverlay(false);
		setCurrentCardId(null);
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
				onCardFlip={handleCardFlip}
				onCardLike={handleCardLike}
			/>

			{/* SRS Overlay */}
			{showSrsOverlay && (
				<>
					{/* Backdrop */}
					<Pressable
						className="absolute inset-0 bg-black/40"
						onPress={dismissSrsOverlay}
					/>
					{/* Modal */}
					<View
						className="absolute bottom-24 left-4 right-4 bg-synap-teal-medium rounded-2xl p-5 border border-synap-teal-light"
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.3,
							shadowRadius: 8,
						}}
					>
						<Text className="text-white text-center font-semibold text-lg mb-2">
							Tu t&apos;en souviens ?
						</Text>
						<Text className="text-text-secondary text-center text-sm mb-5">
							Évalue ta mémorisation
						</Text>
						<View className="flex-row justify-between gap-2">
							<Pressable
								className="flex-1 bg-synap-pink py-4 rounded-xl active:opacity-80"
								onPress={() => handleSrsResponse("AGAIN")}
							>
								<Text className="text-white text-center font-semibold">
									{t("srs.again")}
								</Text>
								<Text className="text-white/70 text-center text-xs mt-1">1 min</Text>
							</Pressable>
							<Pressable
								className="flex-1 bg-synap-ocean py-4 rounded-xl active:opacity-80"
								onPress={() => handleSrsResponse("HARD")}
							>
								<Text className="text-white text-center font-semibold">
									{t("srs.hard")}
								</Text>
								<Text className="text-white/70 text-center text-xs mt-1">10 min</Text>
							</Pressable>
							<Pressable
								className="flex-1 bg-synap-emerald py-4 rounded-xl active:opacity-80"
								onPress={() => handleSrsResponse("GOOD")}
							>
								<Text className="text-synap-teal text-center font-semibold">
									{t("srs.good")}
								</Text>
								<Text className="text-synap-teal/70 text-center text-xs mt-1">
									1 jour
								</Text>
							</Pressable>
							<Pressable
								className="flex-1 bg-synap-gold py-4 rounded-xl active:opacity-80"
								onPress={() => handleSrsResponse("EASY")}
							>
								<Text className="text-synap-teal text-center font-semibold">
									{t("srs.easy")}
								</Text>
								<Text className="text-synap-teal/70 text-center text-xs mt-1">
									4 jours
								</Text>
							</Pressable>
						</View>
					</View>
				</>
			)}

			<StatusBar style="light" />
		</View>
	);
}
