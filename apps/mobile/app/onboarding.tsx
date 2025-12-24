import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter, Href } from "expo-router";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../src/stores/useAuthStore";

const INTERESTS = [
	{ key: "history", emoji: "📜" },
	{ key: "philosophy", emoji: "🤔" },
	{ key: "science", emoji: "🔬" },
	{ key: "tech", emoji: "💻" },
	{ key: "psychology", emoji: "🧠" },
	{ key: "economics", emoji: "📊" },
	{ key: "art", emoji: "🎨" },
	{ key: "literature", emoji: "📚" },
	{ key: "politics", emoji: "🏛️" },
	{ key: "biases", emoji: "🎯" },
	{ key: "space", emoji: "🚀" },
	{ key: "nature", emoji: "🌿" },
];

export default function OnboardingScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);

	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

	const toggleInterest = (key: string) => {
		setSelectedInterests((prev) =>
			prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
		);
	};

	const handleContinue = () => {
		// TODO: Save interests to API
		router.replace("/(tabs)" as Href);
	};

	const isValid = selectedInterests.length >= 3;

	return (
		<View className="flex-1 bg-synap-teal">
			<StatusBar style="light" />
			<ScrollView className="flex-1 px-6 pt-16">
				{/* Header */}
				<View className="items-center mb-8">
					<Text className="text-2xl font-bold text-white mb-2">
						{t("onboarding.welcome")}
						{user?.username ? `, ${user.username}` : ""} 👋
					</Text>
				</View>

				{/* Interest Picker */}
				<View className="mb-8">
					<Text className="text-xl font-semibold text-white mb-2">
						{t("onboarding.pickInterests")}
					</Text>
					<Text className="text-text-secondary mb-6">
						{t("onboarding.pickInterestsSubtitle")}
					</Text>

					{/* Interest Grid */}
					<View className="flex-row flex-wrap gap-3">
						{INTERESTS.map((interest) => {
							const isSelected = selectedInterests.includes(interest.key);
							return (
								<Pressable
									key={interest.key}
									onPress={() => toggleInterest(interest.key)}
									className={`flex-row items-center gap-2 px-4 py-3 rounded-lg border ${
										isSelected
											? "bg-synap-emerald border-synap-emerald"
											: "bg-synap-teal-medium border-synap-teal-light"
									}`}
								>
									<Text className="text-lg">{interest.emoji}</Text>
									<Text
										className={`font-medium ${
											isSelected ? "text-synap-teal" : "text-white"
										}`}
									>
										{t(`interests.${interest.key}`)}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Selection count */}
				<View className="items-center mb-8">
					<Text className="text-text-secondary">
						{selectedInterests.length}/3 minimum
					</Text>
				</View>
			</ScrollView>

			{/* Bottom CTA */}
			<View className="px-6 pb-8 pt-4">
				<Pressable
					className={`py-4 rounded-lg ${
						isValid ? "bg-synap-pink active:bg-synap-pink-dark" : "bg-gray-600"
					}`}
					onPress={handleContinue}
					disabled={!isValid}
				>
					<Text className="text-white text-lg font-semibold text-center">
						{t("onboarding.letsGo")}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
