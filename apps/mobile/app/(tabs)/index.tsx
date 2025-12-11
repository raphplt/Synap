import React, { useRef, useState, useCallback } from "react";
import {
	View,
	Dimensions,
	ActivityIndicator,
	StatusBar,
	ViewToken,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FeedItem } from "../../components/FeedItem";
import { ICard } from "@memex/shared";
import { useFeed } from "../../hooks/useFeed";

const { height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 49 + 34;
const ITEM_HEIGHT = height - TAB_BAR_HEIGHT;

export default function FeedScreen() {
	const { data, fetchNextPage, hasNextPage, isLoading } = useFeed();

	const flattenData = data?.pages.flatMap((page) => page.data) || [];

	const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
	const onViewableItemsChanged = useCallback(
		({ viewableItems: vItems }: { viewableItems: ViewToken[] }) => {
			setViewableItems(vItems);
		},
		[]
	);
	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 80,
	}).current;

	const renderItem = useCallback(
		({ item, index }: { item: ICard; index: number }) => {
			const isVisible = viewableItems.some((v) => v.item.id === item.id);
			return <FeedItem item={item} isVisible={isVisible} />;
		},
		[viewableItems]
	);

	if (isLoading) {
		return (
			<View className="flex-1 bg-black justify-center items-center">
				<ActivityIndicator size="large" color="#ffffff" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-black">
			<StatusBar barStyle="light-content" />
			<FlashList
				data={flattenData}
				renderItem={renderItem}
				// estimatedItemSize={ITEM_HEIGHT}
				pagingEnabled
				decelerationRate="fast"
				snapToAlignment="center"
				showsVerticalScrollIndicator={false}
				onEndReached={() => {
					if (hasNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				keyExtractor={(item, index) => item.id + index}
			/>
		</View>
	);
}
