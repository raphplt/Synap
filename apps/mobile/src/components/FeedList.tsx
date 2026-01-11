import { CardBase } from "@synap/shared";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedCard, FeedCardType } from "./FeedCard";

export interface FeedItem extends CardBase {
	cardType: FeedCardType;
	distractors?: string[];
}

type FeedListProps = {
	items: CardBase[];
	reviewCardIds?: string[];
	onEndReached: () => void;
	refreshing: boolean;
	onRefresh: () => void;
	isFetchingNextPage: boolean;
	onReview?: (cardId: string, rating: "forgot" | "retained") => void;
	onQuizAnswer?: (cardId: string, correct: boolean) => void;
	onLike?: (cardId: string) => void;
	onBookmark?: (cardId: string) => void;
	onCardView?: () => void;
};

export function FeedList({
	items,
	reviewCardIds = [],
	onEndReached,
	refreshing,
	onRefresh,
	isFetchingNextPage,
	onReview,
	onQuizAnswer,
	onLike,
	onBookmark,
	onCardView,
}: FeedListProps) {
	const [listHeight, setListHeight] = useState<number>(0);
	const insets = useSafeAreaInsets();

	const feedItems: FeedItem[] = useMemo(() => {
		const reviewSet = new Set(reviewCardIds);

		return items.map((item, index) => {
			const isQuiz = (index + 1) % 7 === 0 && index > 0;
			const isReview = reviewSet.has(item.id);

			let cardType: FeedCardType = "discovery";
			if (isQuiz) {
				cardType = "quiz";
			} else if (isReview) {
				cardType = "review";
			}

			let distractors: string[] = [];
			if (cardType === "quiz") {
				const otherCards = items.filter((c) => c.id !== item.id);
				const shuffled = [...otherCards].sort(() => Math.random() - 0.5);
				distractors = shuffled.slice(0, 3).map((c) => c.summary);
			}

			return {
				...item,
				cardType,
				distractors,
			};
		});
	}, [items, reviewCardIds]);

	return (
		<View
			style={{ flex: 1 }}
			onLayout={(e) => {
				const height = e.nativeEvent.layout.height;
				if (height > 0) setListHeight(height);
			}}
		>
			{listHeight > 0 && (
				<FlashList
					data={feedItems}
					renderItem={({ item }: { item: FeedItem }) => (
						<FeedCard
							card={item}
							cardType={item.cardType}
							height={listHeight}
							distractors={item.distractors}
							onReview={onReview}
							onQuizAnswer={onQuizAnswer}
							onLike={onLike}
							onBookmark={onBookmark}
						/>
					)}
					pagingEnabled
					showsVerticalScrollIndicator={false}
					onEndReached={onEndReached}
					onEndReachedThreshold={0.8}
					keyExtractor={(item: FeedItem) => item.id}
					contentContainerStyle={{
						paddingBottom: insets.bottom,
					}}
					ListFooterComponent={
						isFetchingNextPage ? (
							<View className="py-4 items-center justify-center">
								<ActivityIndicator color="#06D6A0" />
							</View>
						) : null
					}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06D6A0" />
					}
					onViewableItemsChanged={({ viewableItems }) => {
						if (viewableItems.length > 0 && onCardView) {
							onCardView();
						}
					}}
					viewabilityConfig={{
						itemVisiblePercentThreshold: 50,
					}}
				/>
			)}
		</View>
	);
}
