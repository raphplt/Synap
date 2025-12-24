import "react-native-gesture-handler";
import "react-native-reanimated";
import "../src/lib/i18n";
import { Stack } from "expo-router";
import {
	QueryClient,
	QueryClientProvider,
	focusManager,
} from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/stores/useAuthStore";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			refetchOnMount: "always",
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
		},
	},
});

function onAppStateChange(status: AppStateStatus) {
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
}

const RootView = GestureHandlerRootView as React.ComponentType<
	PropsWithChildren<{ style?: object }>
>;

export default function RootLayout() {
	const initialize = useAuthStore((state) => state.initialize);
	const isInitialized = useAuthStore((state) => state.isInitialized);

	useEffect(() => {
		initialize();
		const subscription = AppState.addEventListener("change", onAppStateChange);
		return () => subscription.remove();
	}, [initialize]);

	if (!isInitialized) {
		return null;
	}

	return (
		<RootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="landing" />
						<Stack.Screen name="login" />
						<Stack.Screen name="signup" />
						<Stack.Screen name="onboarding" />
						<Stack.Screen name="(tabs)" />
					</Stack>
				</QueryClientProvider>
			</SafeAreaProvider>
		</RootView>
	);
}
