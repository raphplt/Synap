import { CardBase } from "@synap/shared";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedCard, FeedCardType } from "./FeedCard";

export interface FeedItem extends CardBase {
	cardType: FeedCardType;
	distractors?: string[];
}

type FeedListProps = {
	items: CardBase[];
	reviewCardIds?: string[]; // IDs of cards that need review
	onEndReached: () => void;
	refreshing: boolean;
	onRefresh: () => void;
	isFetchingNextPage: boolean;
	onReview?: (cardId: string, rating: "forgot" | "retained") => void;
	onQuizAnswer?: (cardId: string, correct: boolean) => void;
	onLike?: (cardId: string) => void;
	onBookmark?: (cardId: string) => void;
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
}: FeedListProps) {
	const [listHeight, setListHeight] = React.useState<number>(0);
	const insets = useSafeAreaInsets();

	// Transform items into FeedItems with types and generate quiz distractors
	const feedItems: FeedItem[] = useMemo(() => {
		const reviewSet = new Set(reviewCardIds);

		return items.map((item, index) => {
			// Every 7th card is a quiz (starting from 6th)
			const isQuiz = (index + 1) % 7 === 0 && index > 0;

			// Check if card needs review
			const isReview = reviewSet.has(item.id);

			let cardType: FeedCardType = "discovery";
			if (isQuiz) {
				cardType = "quiz";
			} else if (isReview) {
				cardType = "review";
			}

			// Generate distractors for quiz cards from nearby cards
			let distractors: string[] = [];
			if (cardType === "quiz") {
				// Pick 3 random summaries from other cards as distractors
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
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor="#06D6A0"
						/>
					}
				/>
			)}
		</View>
	);
}
