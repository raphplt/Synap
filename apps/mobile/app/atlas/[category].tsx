import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { getApiBaseUrl } from "../../src/lib/api";
import type { AtlasDeckStats, AtlasCategory } from "../../src/types/atlas";
import { useState, useCallback } from "react";
import Animated, { ZoomIn } from "react-native-reanimated";

async function fetchDecksByCategory(
	token: string,
	categorySlug: string,
): Promise<AtlasDeckStats[]> {
	const response = await fetch(`${getApiBaseUrl()}/atlas?category=${categorySlug}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch decks");
	return response.json();
}

async function fetchCategoryInfo(
	categorySlug: string,
): Promise<{ name: string; description?: string; imageUrl?: string }> {
	const response = await fetch(`${getApiBaseUrl()}/decks/categories`);
	if (!response.ok) throw new Error("Failed to fetch category");
	const categories: AtlasCategory[] = await response.json();
	const category = categories.find((c) => c.slug === categorySlug);
	if (!category) {
		return { name: categorySlug };
	}
	return {
		name: category.name,
		description: category.description ?? undefined,
		imageUrl: category.imageUrl ?? undefined,
	};
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

function ProgressRing({
	percent,
	size = 50,
}: {
	percent: number;
	size?: number;
}) {
	const isGold = percent >= 100;
	const color = isGold ? "#FFD166" : "#06D6A0";

	return (
		<View
			style={{ width: size, height: size }}
			className="items-center justify-center"
		>
			<View
				className="absolute rounded-full border-synap-teal-light"
				style={{ width: size, height: size, borderWidth: 3 }}
			/>
			<View
				className="absolute rounded-full"
				style={{
					width: size,
					height: size,
					borderWidth: 3,
					borderColor: color,
					borderLeftColor: "transparent",
					borderBottomColor: percent > 25 ? color : "transparent",
					borderRightColor: percent > 50 ? color : "transparent",
					borderTopColor: percent > 75 ? color : "transparent",
					transform: [{ rotate: "-90deg" }],
				}}
			/>
			<Text className="text-white text-xs font-bold">{percent}%</Text>
		</View>
	);
}

function DeckCard({ deck, onPress }: { deck: AtlasDeckStats; onPress: () => void }) {
	const { t } = useTranslation();
	const isGold = deck.progressPercent >= 100;

	return (
		<Pressable
			className={`bg-synap-teal-medium rounded-xl p-4 border ${
				isGold ? "border-synap-gold" : "border-synap-teal-light"
			} active:bg-synap-teal-light shadow-sm mb-3`}
			onPress={onPress}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-1 mr-3">
					<Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
						{deck.name}
					</Text>
					<Text className="text-text-secondary text-sm mb-3" numberOfLines={2}>
						{deck.description}
					</Text>
					<View className="flex-row items-center gap-3">
						<View className="bg-synap-teal-dark px-2 py-1 rounded-md">
							<Text className="text-text-tertiary text-xs font-medium">
								{deck.masteredCards}/{deck.totalCards} {t("atlas.mastered")}
							</Text>
						</View>
						{deck.goldCards > 0 && (
							<View className="bg-synap-gold/10 px-2 py-1 rounded-md border border-synap-gold/30">
								<Text className="text-synap-gold text-xs font-bold">⭐ {deck.goldCards}</Text>
							</View>
						)}
					</View>
				</View>
				<View className="flex-row items-center">
					<ProgressRing percent={deck.progressPercent} />
					<Ionicons
						name="chevron-forward"
						size={24}
						color="#4A6572"
						style={{ marginLeft: 12 }}
						opacity={0.5}
					/>
				</View>
			</View>
		</Pressable>
	);
}

/**
 * Remove Confirmation Modal
 */
function RemoveConfirmationModal({
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
						<View className="w-16 h-16 rounded-full bg-synap-pink/20 items-center justify-center mb-3">
							<Ionicons name="trash-outline" size={40} color="#EF476F" />
						</View>
						<Text className="text-white text-xl font-bold text-center">
							{t("atlas.removeThemeTitle", "Retirer ce thème ?")}
						</Text>
					</View>

					<Text className="text-text-secondary text-center mb-6">
						{t("atlas.removeThemeDesc", "Voulez-vous retirer")}{" "}
						<Text className="text-synap-pink font-semibold">{categoryName}</Text>{" "}
						{t("atlas.removeThemeDesc2", "de vos thèmes personnels ?")}
					</Text>

					<View className="flex-row gap-3">
						<Pressable
							onPress={onCancel}
							className="flex-1 py-3 rounded-xl bg-synap-teal-dark border border-synap-teal-light"
						>
							<Text className="text-white text-center font-semibold">{t("common.cancel")}</Text>
						</Pressable>
						<Pressable onPress={onConfirm} className="flex-1 py-3 rounded-xl bg-synap-pink">
							<Text className="text-white text-center font-bold">{t("common.confirm")}</Text>
						</Pressable>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

export default function CategoryDecksScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { category: categorySlug } = useLocalSearchParams<{
		category: string;
	}>();
	const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
		const setUser = useAuthStore((state) => state.setUser);

		const [removeModalVisible, setRemoveModalVisible] = useState(false);
		const [isUpdating, setIsUpdating] = useState(false);

		const { data: categoryInfo } = useQuery({
			queryKey: ["category-info", categorySlug],
			queryFn: () => fetchCategoryInfo(categorySlug!),
			enabled: !!categorySlug,
		});

		const {
			data: decks,
			isLoading,
			error,
		} = useQuery({
			queryKey: ["category-decks", categorySlug, token],
			queryFn: () => fetchDecksByCategory(token!, categorySlug!),
			enabled: !!token && !!categorySlug,
		});

		// Check if this category is in user's interests
		const categoryName = categoryInfo?.name ?? categorySlug ?? "";
		const isInInterests =
			user?.interests?.includes(categoryName) || user?.interests?.includes(categorySlug ?? "");

		// Remove interest mutation
		const removeInterestMutation = useMutation({
			mutationFn: async () => {
				if (!user || !token) return;
				const currentInterests = user.interests || [];
				// Filter out both name and slug variants
				const newInterests = currentInterests.filter(
					(i) => i !== categoryName && i !== categorySlug,
				);
				const updatedUser = await updateUserInterests(token, user.id, newInterests);
				return updatedUser;
			},
			onMutate: () => setIsUpdating(true),
			onSuccess: (updatedUser) => {
				if (updatedUser) {
					setUser({ ...user!, interests: updatedUser.interests });
				}
				setIsUpdating(false);
				// Navigate back after removal
				router.back();
			},
			onError: (err) => {
				setIsUpdating(false);
				Alert.alert(t("common.error"), t("feed.error"));
				console.error(err);
			},
		});

		const handleOpenRemoveModal = useCallback(() => {
			setRemoveModalVisible(true);
		}, []);

		const handleConfirmRemove = useCallback(() => {
			removeInterestMutation.mutate();
			setRemoveModalVisible(false);
		}, [removeInterestMutation]);

		const handleCancelRemove = useCallback(() => {
			setRemoveModalVisible(false);
		}, []);

		return (
			<View className="flex-1 bg-synap-teal">
				<SafeAreaView className="flex-1">
					<View className="flex-1 px-4 pt-2">
						{/* Header with back button and settings */}
						<View className="flex-row items-center justify-between mb-6 z-10">
							<View className="flex-row items-center flex-1">
								<Pressable
									onPress={() => router.back()}
									className="mr-4 w-10 h-10 bg-synap-teal-medium/80 rounded-full items-center justify-center border border-synap-teal-light/50"
								>
									<Ionicons name="arrow-back" size={20} color="white" />
								</Pressable>
							</View>

							{/* Settings button - only show if category is in interests */}
							{isInInterests && (
								<Pressable
									onPress={handleOpenRemoveModal}
									className="w-10 h-10 bg-synap-teal-medium/80 rounded-full items-center justify-center border border-synap-teal-light/50"
									disabled={isUpdating}
								>
									{isUpdating ? (
										<ActivityIndicator size="small" color="#06D6A0" />
									) : (
										<Ionicons name="settings-outline" size={20} color="white" />
									)}
								</Pressable>
							)}
						</View>

						<View className="mb-6 z-10">
							<Text className="text-white text-3xl font-extrabold shadow-sm">{categoryName}</Text>
							{categoryInfo?.description && (
								<Text className="text-synap-emerald text-base mt-2 font-medium" numberOfLines={2}>
									{categoryInfo.description}
								</Text>
							)}
						</View>

						{/* Content */}
						{isLoading ? (
							<View className="flex-1 items-center justify-center">
								<ActivityIndicator color="#06D6A0" size="large" />
							</View>
						) : error ? (
							<View className="flex-1 items-center justify-center">
								<Text className="text-synap-pink mb-4">{t("common.error")}</Text>
								<Text className="text-text-secondary text-center">{t("feed.error")}</Text>
							</View>
						) : decks && decks.length > 0 ? (
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{ paddingBottom: 80 }}
							>
								<View>
									{decks.map((deck) => (
										<DeckCard
											key={deck.id}
											deck={deck}
											onPress={() => router.push(`/atlas/deck/${deck.id}`)}
										/>
									))}
								</View>
							</ScrollView>
						) : (
							<View className="flex-1 items-center justify-center opacity-50">
								<Text className="text-6xl mb-4 grayscale">📦</Text>
								<Text className="text-white text-lg font-semibold mb-2">
									{t("atlas.emptyCategory")}
								</Text>
								<Text className="text-text-secondary text-center px-8">
									{t("atlas.emptyCategoryDesc")}
								</Text>
							</View>
						)}
					</View>
				</SafeAreaView>

				{/* Remove Confirmation Modal */}
				<RemoveConfirmationModal
					visible={removeModalVisible}
					categoryName={categoryName}
					onConfirm={handleConfirmRemove}
					onCancel={handleCancelRemove}
				/>
			</View>
		);
}
