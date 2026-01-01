import { Redirect, Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/stores/useAuthStore";

export default function IndexScreen() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isInitialized = useAuthStore((state) => state.isInitialized);
	const isLoading = useAuthStore((state) => state.isLoading);

	if (!isInitialized || isLoading) {
		return (
			<View
				className="flex-1 items-center justify-center"
				style={{ backgroundColor: "#073B4C" }}
			>
				<ActivityIndicator color="#06D6A0" size="large" />
			</View>
		)
	}

	if (isAuthenticated) {
		return <Redirect href={"/(tabs)" as Href} />;
	}

	return <Redirect href={"/landing" as Href} />;
}
