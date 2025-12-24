import { Stack } from "expo-router";

export default function AtlasLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: "#073B4C" },
			}}
		/>
	);
}
