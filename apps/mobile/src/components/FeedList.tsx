import { CardBase } from "@synap/shared";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardItem } from "./CardItem";

type FeedListProps = {
	items: CardBase[];
	onEndReached: () => void;
	refreshing: boolean;
	onRefresh: () => void;
	isFetchingNextPage: boolean;
	onCardFlip?: (cardId: string) => void;
	onCardLike?: (cardId: string) => void;
};

export function FeedList({
	items,
	onEndReached,
	refreshing,
	onRefresh,
	isFetchingNextPage,
	onCardFlip,
	onCardLike,
}: FeedListProps) {
	const [listHeight, setListHeight] = React.useState<number>(0);
	const insets = useSafeAreaInsets();

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
					data={items}
					renderItem={({ item }: { item: CardBase }) => (
						<CardItem
							card={item}
							height={listHeight}
							onFlip={onCardFlip}
							onLike={onCardLike}
						/>
					)}
					pagingEnabled
					showsVerticalScrollIndicator={false}
					onEndReached={onEndReached}
					onEndReachedThreshold={0.8}
					keyExtractor={(item: CardBase) => item.id}
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
