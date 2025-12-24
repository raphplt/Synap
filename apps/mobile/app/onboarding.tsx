import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter, Href } from "expo-router";
import {
	Text,
	View,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../src/stores/useAuthStore";
import { getCategories, updateUserInterests, Category } from "../src/lib/api";

// Map category slugs to emojis for visual appeal
const CATEGORY_EMOJIS: Record<string, string> = {
	histoire: "📜",
	philosophie: "🤔",
	sciences: "🔬",
	technologie: "💻",
	psychologie: "🧠",
	economie: "📊",
	art: "🎨",
	litterature: "📚",
	politique: "🏛️",
	"biais-cognitifs": "🎯",
	astronomie: "🚀",
	nature: "🌿",
	geographie: "�",
	musique: "🎵",
	cinema: "🎬",
	sport: "⚽",
	cuisine: "🍳",
	sante: "🏥",
	langues: "🗣️",
	mathematiques: "📐",
};

function getEmojiForCategory(slug: string): string {
	return CATEGORY_EMOJIS[slug] ?? "📚";
}

export default function OnboardingScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const setUser = useAuthStore((state) => state.setUser);

	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

	// Fetch categories from API
	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategories(),
	});

	// Mutation to save interests
	const saveInterestsMutation = useMutation({
		mutationFn: async (interests: string[]) => {
			if (!user?.id || !token) {
				throw new Error("Not authenticated");
			}
			return updateUserInterests(user.id, interests, token);
		},
		onSuccess: (updatedUser) => {
			// Update local store with new user data
			setUser(updatedUser);
			router.replace("/(tabs)" as Href);
		},
		onError: (error) => {
			console.error("Failed to save interests:", error);
			// Still navigate even if save fails - can retry later
			router.replace("/(tabs)" as Href);
		},
	});

	const toggleInterest = (slug: string) => {
		setSelectedInterests((prev) =>
			prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
		);
	};

	const handleContinue = () => {
		saveInterestsMutation.mutate(selectedInterests);
	};

	const isValid = selectedInterests.length >= 3;
	const isSaving = saveInterestsMutation.isPending;

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

					{/* Category Grid */}
					{isLoadingCategories ? (
						<View className="items-center justify-center py-12">
							<ActivityIndicator color="#06D6A0" size="large" />
						</View>
					) : (
						<View className="flex-row flex-wrap gap-3">
							{categories?.map((category: Category) => {
								const isSelected = selectedInterests.includes(category.slug);
								return (
									<Pressable
										key={category.id}
										onPress={() => toggleInterest(category.slug)}
										className={`flex-row items-center gap-2 px-4 py-3 rounded-lg border ${
											isSelected
												? "bg-synap-emerald border-synap-emerald"
												: "bg-synap-teal-medium border-synap-teal-light"
										}`}
									>
										<Text className="text-lg">{getEmojiForCategory(category.slug)}</Text>
										<Text
											className={`font-medium ${
												isSelected ? "text-synap-teal" : "text-white"
											}`}
										>
											{category.name}
										</Text>
									</Pressable>
								);
							})}
						</View>
					)}
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
						isValid && !isSaving
							? "bg-synap-pink active:bg-synap-pink-dark"
							: "bg-gray-600"
					}`}
					onPress={handleContinue}
					disabled={!isValid || isSaving}
				>
					{isSaving ? (
						<ActivityIndicator color="white" />
					) : (
						<Text className="text-white text-lg font-semibold text-center">
							{t("onboarding.letsGo")}
						</Text>
					)}
				</Pressable>
			</View>
		</View>
	);
}
