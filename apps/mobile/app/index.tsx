import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { FeedList } from "../src/components/FeedList";
import { useFeed } from "../src/hooks/useFeed";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
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

	if (isLoading) {
		return (
			<View style={{ flex: 1, backgroundColor: "#0f172a" }} className="flex-1 items-center justify-center bg-ink">
				<ActivityIndicator color="#22d3ee" size="large" />
				<Text className="text-sand mt-3">Chargement du feed</Text>
			</View>
		);
	}

	console.log(error);
	console.log(items);
	console.log(isRefetching);

	if (error != null) {
		return (
			<View className="flex-1 items-center justify-center bg-ink px-6">
				<Text className="text-amber text-lg font-semibold mb-2">
					Impossible de charger les cartes
				</Text>
				<Text className="text-sand text-center mb-4">
					{(error as Error).message}
				</Text>
				<Text className="text-neon underline" onPress={() => refetch()}>
					Réessayer
				</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }} className="bg-ink">
			<View style={{ flex: 1 }} className="bg-ink">
				<Text className="text-gray-500 text-2xl">Items</Text>
				<FeedList
					items={items}
					onEndReached={loadMore}
					refreshing={isRefetching}
					onRefresh={() => refetch()}
					isFetchingNextPage={isFetchingNextPage}
				/>
				<StatusBar style="light" />
			</View>
		</SafeAreaView>
	);
}
