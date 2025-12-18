import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const insets = useSafeAreaInsets();
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#0f172a", // ink
					borderTopColor: "#334155",
					height: 60 + insets.bottom,
					paddingBottom: insets.bottom + 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: "#22d3ee", // neon
				tabBarInactiveTintColor: "#94a3b8",
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Accueil",
					tabBarIcon: ({ color }) => (
						<Ionicons name="home" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="quiz"
				options={{
					title: "Quiz",
					tabBarIcon: ({ color }) => (
						<Ionicons name="game-controller" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					tabBarIcon: ({ color }) => (
						<Ionicons name="person" size={24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
