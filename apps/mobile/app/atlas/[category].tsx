import {
	View,
	Text,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { getApiBaseUrl } from "../../src/lib/api";

interface DeckStats {
	id: string;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	categoryName?: string | null;
	totalCards: number;
	masteredCards: number;
	goldCards: number;
	progressPercent: number;
}

async function fetchDecksByCategory(
	token: string,
	categorySlug: string
): Promise<DeckStats[]> {
	const response = await fetch(
		`${getApiBaseUrl()}/atlas?category=${categorySlug}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	if (!response.ok) throw new Error("Failed to fetch decks");
	return response.json();
}

interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
}

async function fetchCategoryInfo(
	categorySlug: string
): Promise<{ name: string; description?: string }> {
	const response = await fetch(`${getApiBaseUrl()}/decks/categories`);
	if (!response.ok) throw new Error("Failed to fetch category");
	const categories: Category[] = await response.json();
	const category = categories.find((c) => c.slug === categorySlug);
	if (!category) {
		return { name: categorySlug };
	}
	return {
		name: category.name,
		description: category.description ?? undefined,
	};
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

function DeckCard({ deck }: { deck: DeckStats }) {
	const { t } = useTranslation();
	const isGold = deck.progressPercent >= 100;

	return (
		<Pressable
			className={`bg-synap-teal-medium rounded-xl p-4 border ${
				isGold ? "border-synap-gold" : "border-synap-teal-light"
			} active:bg-synap-teal-light`}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-1 mr-3">
					<Text className="text-white font-semibold text-base" numberOfLines={1}>
						{deck.name}
					</Text>
					<Text className="text-text-secondary text-sm" numberOfLines={2}>
						{deck.description}
					</Text>
					<View className="flex-row mt-2 gap-4">
						<Text className="text-text-tertiary text-xs">
							{deck.masteredCards}/{deck.totalCards}{" "}
							{t("atlas.mastered", "maîtrisées")}
						</Text>
						{deck.goldCards > 0 && (
							<Text className="text-synap-gold text-xs">
								⭐ {deck.goldCards} {t("atlas.gold", "gold")}
							</Text>
						)}
					</View>
				</View>
				<ProgressRing percent={deck.progressPercent} />
			</View>
		</Pressable>
	);
}

export default function CategoryDecksScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const { category: categorySlug } = useLocalSearchParams<{
		category: string;
	}>();
	const token = useAuthStore((state) => state.token);

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

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
			<View className="flex-1 p-4">
				{/* Header with back button */}
				<View className="flex-row items-center mb-6">
					<Pressable onPress={() => router.back()} className="mr-4 p-2 -ml-2">
						<Ionicons name="arrow-back" size={24} color="white" />
					</Pressable>
					<View className="flex-1">
						<Text className="text-white text-2xl font-bold">
							{categoryInfo?.name ?? categorySlug}
						</Text>
						{categoryInfo?.description && (
							<Text className="text-text-secondary" numberOfLines={1}>
								{categoryInfo.description}
							</Text>
						)}
					</View>
				</View>

				{/* Content */}
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator color="#06D6A0" size="large" />
					</View>
				) : error ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-synap-pink mb-4">{t("common.error")}</Text>
						<Text className="text-text-secondary text-center">
							Impossible de charger les decks.
						</Text>
					</View>
				) : decks && decks.length > 0 ? (
					<ScrollView showsVerticalScrollIndicator={false}>
						<View className="gap-3">
							{decks.map((deck) => (
								<DeckCard key={deck.id} deck={deck} />
							))}
						</View>
					</ScrollView>
				) : (
					<View className="flex-1 items-center justify-center">
						<Text className="text-4xl mb-4">📦</Text>
						<Text className="text-white text-lg font-semibold mb-2">Aucun deck</Text>
						<Text className="text-text-secondary text-center">
							Cette catégorie ne contient pas encore de decks.
						</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
