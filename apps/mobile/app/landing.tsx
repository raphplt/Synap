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
					<View className="shadow-2xl shadow-black/50 rounded-full">
						<Image
							source={require("../assets/icon-transparent.png")}
							className="w-32 h-32 rounded-full bg-white/20 m-4"
						/>
					</View>

					<Text className="text-5xl font-extrabold text-white tracking-tighter mb-4 shadow-sm">
						SYNAP
					</Text>

					<Text className="text-xl text-synap-emerald-light font-bold text-center mb-3">
						{t("landing.tagline")}
					</Text>

					<Text className="text-lg text-text-secondary text-center leading-relaxed max-w-[80%]">
						{t("landing.subtitle")}
					</Text>
				</View>

				<View className="w-full gap-5 px-4">
					<Pressable
						className="bg-synap-pink py-4 px-8 rounded-xl shadow-lg border-b-4 border-synap-pink-dark active:border-b-0 active:translate-y-1 transition-all active:bg-synap-pink-light"
						onPress={() => router.push("/signup" as Href)}
					>
						<Text className="text-white text-xl font-bold text-center tracking-wide">
							{t("landing.getStarted")}
						</Text>
					</Pressable>

					{/* Secondary CTA */}
					<Pressable
						className="py-4 px-8 active:opacity-70"
						onPress={() => router.push("/login" as Href)}
					>
						<Text className="text-synap-ocean-light text-lg font-medium text-center">
							{t("landing.alreadyMember")}
						</Text>
					</Pressable>
				</View>
			</LinearGradient>
		</View>
	);
}
