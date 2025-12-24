import { Redirect, Href } from "expo-router";
import { useAuthStore } from "../src/stores/useAuthStore";

export default function IndexScreen() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	// Redirect based on auth state
	if (isAuthenticated) {
		return <Redirect href={"/(tabs)" as Href} />;
	}

	return <Redirect href={"/landing" as Href} />;
}
