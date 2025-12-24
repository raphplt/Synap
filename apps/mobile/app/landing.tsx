import { StatusBar } from "expo-status-bar";
import { useRouter, Href } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

export default function LandingScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<View className="flex-1 bg-synap-teal">
			<StatusBar style="light" />
			<LinearGradient
				colors={["#073B4C", "#0A5266", "#073B4C"]}
				className="flex-1 items-center justify-center px-8"
			>
				{/* Hero Section */}
				<View className="items-center mb-16">
					{/* Brain Icon Placeholder - Replace with Lottie animation */}
					<View className="w-32 h-32 rounded-full bg-synap-teal-medium border-2 border-synap-emerald items-center justify-center mb-8">
						<Text className="text-6xl">🧠</Text>
					</View>

					{/* Logo */}
					<Text className="text-4xl font-bold text-white tracking-tight mb-4">
						SYNAP
					</Text>

					{/* Tagline */}
					<Text className="text-xl text-synap-emerald font-semibold text-center mb-2">
						{t("landing.tagline")}
					</Text>

					{/* Subtitle */}
					<Text className="text-base text-text-secondary text-center">
						{t("landing.subtitle")}
					</Text>
				</View>

				{/* CTA Buttons */}
				<View className="w-full gap-4">
					{/* Primary CTA */}
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
