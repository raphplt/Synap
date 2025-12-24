import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					position: "absolute",
					backgroundColor: "rgba(7, 59, 76, 0.85)",
					borderTopWidth: 0,
					height: 70 + insets.bottom,
					paddingBottom: insets.bottom + 10,
					paddingTop: 10,
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
				},
				tabBarActiveTintColor: "#06D6A0", // synap-emerald
				tabBarInactiveTintColor: "#71717A", // text-tertiary
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "500",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Feed",
					tabBarIcon: ({ color, focused }) => (
						<View style={focused ? styles.activeIcon : undefined}>
							<Ionicons
								name={focused ? "flash" : "flash-outline"}
								size={20}
								color={color}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="atlas"
				options={{
					title: "Atlas",
					tabBarIcon: ({ color, focused }) => (
						<View style={focused ? styles.activeIcon : undefined}>
							<Ionicons
								name={focused ? "map" : "map-outline"}
								size={20}
								color={color}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="quiz"
				options={{
					title: "Quiz",
					tabBarIcon: ({ color, focused }) => (
						<View style={focused ? styles.activeIcon : undefined}>
							<Ionicons
								name={focused ? "game-controller" : "game-controller-outline"}
								size={20}
								color={color}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					tabBarIcon: ({ color, focused }) => (
						<View style={focused ? styles.activeIcon : undefined}>
							<Ionicons
								name={focused ? "person" : "person-outline"}
								size={20}
								color={color}
							/>
						</View>
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	activeIcon: {
		backgroundColor: "rgba(6, 214, 160, 0.15)",
		borderRadius: 12,
		padding: 6,
		marginBottom: -4,
	},
});
