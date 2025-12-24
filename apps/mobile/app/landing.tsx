import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter, Href } from "expo-router";
import { Text, View, Pressable, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../src/stores/useAuthStore";

export default function LandingScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			router.replace("/(tabs)" as Href);
		}
	}, [isAuthenticated, router]);

	return (
		<View className="flex-1 bg-synap-teal">
			<StatusBar style="light" />
			<LinearGradient
				colors={["#073B4C", "#0A5266", "#073B4C"]}
				className="flex-1 items-center justify-center px-8"
			>
				<View className="items-center mb-16">
					<Image
						source={require("../assets/icon.png")}
						className="w-32 h-32 rounded-full bg-white/20 m-4"
					/>

					<Text className="text-4xl font-bold text-white tracking-tight mb-4">
						SYNAP
					</Text>

					<Text className="text-xl text-synap-emerald font-semibold text-center mb-2">
						{t("landing.tagline")}
					</Text>

					<Text className="text-base text-text-secondary text-center">
						{t("landing.subtitle")}
					</Text>
				</View>

				<View className="w-full gap-4">
					<Pressable
						className="bg-synap-pink py-4 px-8 rounded-lg active:bg-synap-pink-dark"
						onPress={() => router.push("/signup" as Href)}
					>
						<Text className="text-white text-lg font-semibold text-center">
							{t("landing.getStarted")}
						</Text>
					</Pressable>

					{/* Secondary CTA */}
					<Pressable
						className="py-4 px-8"
						onPress={() => router.push("/login" as Href)}
					>
						<Text className="text-synap-ocean text-base text-center">
							{t("landing.alreadyMember")}
						</Text>
					</Pressable>
				</View>
			</LinearGradient>
		</View>
	);
}
