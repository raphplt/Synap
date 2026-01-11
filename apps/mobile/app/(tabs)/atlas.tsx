import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiBaseUrl } from "../../src/lib/api";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useXpStats } from "../../src/hooks/useGamification";
import type { AtlasCategory } from "../../src/types/atlas";
import { useState, useCallback } from "react";
import Animated, {
	FadeOut,
	Layout,
	SlideInRight,
	SlideOutLeft,
	ZoomIn,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

async function fetchCategories(): Promise<AtlasCategory[]> {
	const response = await fetch(`${getApiBaseUrl()}/decks/categories`);
	if (!response.ok) throw new Error("Failed to fetch categories");
	return response.json();
}

async function updateUserInterests(token: string, userId: string, interests: string[]) {
	const response = await fetch(`${getApiBaseUrl()}/users/${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ interests }),
	});

	if (!response.ok) {
		throw new Error("Failed to update interests");
	}
	return response.json();
}

/**
 * Enhanced Category Card for "My Themes"
 */
function MyThemeCard({
	category,
	onPress,
	xpStats,
}: {
	category: AtlasCategory;
	onPress: () => void;
	xpStats?: { level: number; progress: number };
}) {
	const { t } = useTranslation();
	const icon =
		category.imageUrl && !category.imageUrl.startsWith("http") ? category.imageUrl : "📚";

	const level = xpStats?.level ?? 1;
	const progress = xpStats?.progress ?? 0;

	return (
		<AnimatedPressable
			entering={ZoomIn.duration(400).springify()}
			exiting={FadeOut.duration(200)}
			layout={Layout.springify()}
			className="bg-synap-teal-medium rounded-2xl p-4 border border-synap-teal-light active:bg-synap-teal-light mb-4 shadow-sm"
			onPress={onPress}
		>
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center">
					<View className="w-12 h-12 rounded-xl bg-synap-teal-dark items-center justify-center mr-3">
						<Text className="text-2xl">{icon}</Text>
					</View>
					<View>
						<Text className="text-white font-bold text-lg">{category.name}</Text>
						<Text className="text-synap-emerald font-medium text-xs">
							{t("atlas.level", "Niveau")} {level}
						</Text>
					</View>
				</View>
				<Ionicons name="chevron-forward" size={24} color="#4A6572" opacity={0.5} />
			</View>

			<View className="bg-synap-teal-light h-2 rounded-full overflow-hidden w-full">
				<View
					className="bg-synap-emerald h-full rounded-full"
					style={{ width: `${Math.min(progress * 100, 100)}%` }}
				/>
			</View>
		</AnimatedPressable>
	);
}

/**
 * Comparison Explorer Card
 */
function ExploreCard({
	category,
	onPress,
	onAdd,
}: {
	category: AtlasCategory;
	onPress: () => void;
	onAdd: () => void;
}) {
	const icon =
		category.imageUrl && !category.imageUrl.startsWith("http") ? category.imageUrl : "🔭";

	return (
		<AnimatedPressable
			entering={SlideInRight.duration(300)}
			exiting={SlideOutLeft.duration(200)}
			layout={Layout.springify()}
			className="bg-synap-teal-dark/50 rounded-xl p-3 border border-synap-teal-light/30 active:bg-synap-teal-medium flex-row items-center mb-2"
			onPress={onPress}
		>
			<View className="w-10 h-10 rounded-lg bg-synap-teal-medium items-center justify-center mr-3">
				<Text className="text-xl">{icon}</Text>
			</View>
			<View className="flex-1">
				<Text className="text-white font-semibold text-base">{category.name}</Text>
			</View>
			<Pressable
				onPress={(e) => {
					e.stopPropagation();
					onAdd();
				}}
				className="p-2 -mr-2"
				hitSlop={10}
			>
				<Ionicons name="add-circle-outline" size={24} color="#06D6A0" />
			</Pressable>
		</AnimatedPressable>
	);
}

/**
 * Confirmation Modal Component
 */
function ConfirmationModal({
	visible,
	categoryName,
	onConfirm,
	onCancel,
}: {
	visible: boolean;
	categoryName: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const { t } = useTranslation();

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 bg-black/60 items-center justify-center p-6">
				<Animated.View
					entering={ZoomIn.duration(300).springify()}
					className="bg-synap-teal-medium rounded-2xl p-6 w-full max-w-sm border border-synap-teal-light shadow-2xl"
				>
					<View className="items-center mb-4">
						<View className="w-16 h-16 rounded-full bg-synap-emerald/20 items-center justify-center mb-3">
							<Ionicons name="add-circle" size={40} color="#06D6A0" />
						</View>
						<Text className="text-white text-xl font-bold text-center">
							{t("atlas.addThemeTitle", "Ajouter ce thème ?")}
						</Text>
					</View>

					<Text className="text-text-secondary text-center mb-6">
						{t("atlas.addThemeDesc", "Voulez-vous ajouter")}{" "}
						<Text className="text-synap-emerald font-semibold">{categoryName}</Text>{" "}
						{t("atlas.addThemeDesc2", "à vos thèmes personnels ?")}
					</Text>

					<View className="flex-row gap-3">
						<Pressable
							onPress={onCancel}
							className="flex-1 py-3 rounded-xl bg-synap-teal-dark border border-synap-teal-light"
						>
							<Text className="text-white text-center font-semibold">{t("common.cancel")}</Text>
						</Pressable>
						<Pressable onPress={onConfirm} className="flex-1 py-3 rounded-xl bg-synap-emerald">
							<Text className="text-synap-teal text-center font-bold">{t("common.confirm")}</Text>
						</Pressable>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

export default function AtlasScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const setUser = useAuthStore((state) => state.setUser);
	const { data: xpStats } = useXpStats();
	const [isUpdating, setIsUpdating] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [pendingCategory, setPendingCategory] = useState<AtlasCategory | null>(null);

	const {
		data: categories,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["categories"],
		queryFn: fetchCategories,
	});

	const addInterestMutation = useMutation({
		mutationFn: async (categoryName: string) => {
			if (!user || !token) return;
			const currentInterests = user.interests || [];
			if (currentInterests.includes(categoryName)) return;

			const newInterests = [...currentInterests, categoryName];
			const updatedUser = await updateUserInterests(token, user.id, newInterests);
			return updatedUser;
		},
		onMutate: () => setIsUpdating(true),
		onSuccess: (updatedUser) => {
			if (updatedUser) {
				setUser({ ...user!, interests: updatedUser.interests });
			}
			setIsUpdating(false);
		},
		onError: (err) => {
			setIsUpdating(false);
			Alert.alert(t("common.error"), t("feed.error"));
			console.error(err);
		},
	});

	const handleCategoryPress = (category: AtlasCategory) => {
		router.push(`/atlas/${category.slug}`);
	};

	// Show confirmation modal before adding
	const handleAddInterestRequest = useCallback((category: AtlasCategory) => {
		setPendingCategory(category);
		setModalVisible(true);
	}, []);

	const handleConfirmAdd = useCallback(() => {
		if (pendingCategory) {
			addInterestMutation.mutate(pendingCategory.name);
		}
		setModalVisible(false);
		setPendingCategory(null);
	}, [pendingCategory, addInterestMutation]);

	const handleCancelAdd = useCallback(() => {
		setModalVisible(false);
		setPendingCategory(null);
	}, []);

	// Split categories
	const myInterests = user?.interests ?? [];
	const allCategories = categories ?? [];

	const myThemes = allCategories.filter(
		(c) => myInterests.includes(c.name) || myInterests.includes(c.slug),
	);
	const exploreThemes = allCategories.filter(
		(c) => !myInterests.includes(c.name) && !myInterests.includes(c.slug),
	);

	const getCategoryStats = (categoryName: string) => {
		const catStat = xpStats?.byCategory.find((c) => c.categoryName === categoryName);
		if (catStat) {
			return {
				level: catStat.level,
				progress: (catStat.xp % 100) / 100,
			};
		}
		return { level: 1, progress: 0 };
	};

	return (
		<View className="flex-1 bg-synap-teal">
			<SafeAreaView className="flex-1">
				<View className="p-4 flex-1">
					<View className="flex-row items-center justify-between mb-2">
						<View>
							<Text className="text-white text-3xl font-bold">{t("atlas.title")}</Text>
							<Text className="text-synap-emerald font-medium uppercase tracking-widest text-xs mt-1">
								{t("atlas.subtitle", "Explorer & Maîtriser")}
							</Text>
						</View>
						{isUpdating && <ActivityIndicator size="small" color="#06D6A0" />}
					</View>

					{isLoading ? (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator color="#06D6A0" size="large" />
						</View>
					) : error ? (
						<View className="flex-1 items-center justify-center">
							<Text className="text-synap-pink mb-4">{t("common.error")}</Text>
							<Text className="text-text-secondary text-center">{t("feed.error")}</Text>
						</View>
					) : (
						<ScrollView showsVerticalScrollIndicator={false} className="mt-4">
							{myThemes.length > 0 && (
								<View className="mb-8">
									<Text className="text-white text-xl font-bold mb-4">{t("atlas.myThemes")}</Text>
									{myThemes.map((category) => (
										<MyThemeCard
											key={category.id}
											category={category}
											onPress={() => handleCategoryPress(category)}
											xpStats={getCategoryStats(category.name)}
										/>
									))}
								</View>
							)}

							<View>
								<Text className="text-white text-xl font-bold mb-4">{t("atlas.explore")}</Text>
								{exploreThemes.length > 0 ? (
									exploreThemes.map((category) => (
										<ExploreCard
											key={category.id}
											category={category}
											onPress={() => handleCategoryPress(category)}
											onAdd={() => handleAddInterestRequest(category)}
										/>
									))
								) : (
									<Text className="text-text-secondary italic">{t("atlas.allThemesAdded")}</Text>
								)}
							</View>

							<View className="h-20" />
						</ScrollView>
					)}
				</View>
			</SafeAreaView>

			<ConfirmationModal
				visible={modalVisible}
				categoryName={pendingCategory?.name ?? ""}
				onConfirm={handleConfirmAdd}
				onCancel={handleCancelAdd}
			/>
		</View>
	);
}
