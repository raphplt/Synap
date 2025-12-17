import { CardBase } from '@memex/shared';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, View } from 'react-native';
import { CardItem } from './CardItem';

const { height: screenHeight } = Dimensions.get('window');

type FeedListProps = {
  items: CardBase[];
  onEndReached: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  isFetchingNextPage: boolean;
};

export function FeedList({ items, onEndReached, refreshing, onRefresh, isFetchingNextPage }: FeedListProps) {
  return (
			<FlashList
				data={items}
				renderItem={({ item }) => <CardItem card={item} />}
				pagingEnabled
				estimatedItemSize={screenHeight}
				showsVerticalScrollIndicator={false}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.8}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View className="py-4 items-center justify-center">
							<ActivityIndicator color="#22d3ee" />
						</View>
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#22d3ee"
					/>
				}
			/>
		);
}
