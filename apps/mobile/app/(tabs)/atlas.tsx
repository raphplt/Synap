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

async function fetchAtlas(token: string): Promise<DeckStats[]> {
	const response = await fetch(`${getApiBaseUrl()}/atlas`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch atlas");
	return response.json();
}

function ProgressRing({
	percent,
	size = 60,
}: {
	percent: number;
	size?: number;
}) {
	const strokeWidth = 4;

	return (
		<View style={{ width: size, height: size }}>
			<View className="absolute inset-0 items-center justify-center">
				<Text className="text-white text-sm font-bold">{percent}%</Text>
			</View>
			<View style={{ transform: [{ rotate: "-90deg" }] }}>
				{/* Background circle */}
				<View
					className="absolute rounded-full border-synap-teal-light"
					style={{
						width: size,
						height: size,
						borderWidth: strokeWidth,
					}}
				/>
				{/* Progress circle */}
				<View
					className="rounded-full"
					style={{
						width: size,
						height: size,
						borderWidth: strokeWidth,
						borderColor: percent >= 100 ? "#FFD166" : "#06D6A0",
						borderLeftColor: "transparent",
						borderBottomColor:
							percent > 25 ? (percent >= 100 ? "#FFD166" : "#06D6A0") : "transparent",
						borderRightColor:
							percent > 50 ? (percent >= 100 ? "#FFD166" : "#06D6A0") : "transparent",
						borderTopColor:
							percent > 75 ? (percent >= 100 ? "#FFD166" : "#06D6A0") : "transparent",
					}}
				/>
			</View>
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
			}`}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-1 mr-3">
					<Text className="text-white font-semibold text-base" numberOfLines={1}>
						{deck.name}
					</Text>
					{deck.categoryName && (
						<Text className="text-text-tertiary text-xs">{deck.categoryName}</Text>
					)}
				</View>
				<ProgressRing percent={deck.progressPercent} />
			</View>

			{/* Stats */}
			<View className="flex-row justify-between">
				<View>
					<Text className="text-text-secondary text-xs">
						{deck.masteredCards}/{deck.totalCards} {t("atlas.mastered")}
					</Text>
				</View>
				{deck.goldCards > 0 && (
					<View className="flex-row items-center">
						<Text className="text-synap-gold text-xs">
							⭐ {deck.goldCards} {t("atlas.gold")}
						</Text>
					</View>
				)}
			</View>
		</Pressable>
	);
}

export default function AtlasScreen() {
	const { t } = useTranslation();
	const token = useAuthStore((state) => state.token);

	const {
		data: decks,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["atlas", token],
		queryFn: () => fetchAtlas(token!),
		enabled: !!token,
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
			<View className="flex-1 p-4">
				{/* Header */}
				<View className="mb-6">
					<Text className="text-white text-2xl font-bold">{t("atlas.title")}</Text>
					<Text className="text-text-secondary">{t("atlas.myProgress")}</Text>
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
							Aucun deck disponible pour le moment.
						</Text>
					</View>
				) : decks && decks.length > 0 ? (
					<ScrollView showsVerticalScrollIndicator={false}>
						<View className="gap-4">
							{decks.map((deck) => (
								<DeckCard key={deck.id} deck={deck} />
							))}
						</View>
					</ScrollView>
				) : (
					<View className="flex-1 items-center justify-center">
						<Text className="text-4xl mb-4">📚</Text>
						<Text className="text-white text-lg font-semibold mb-2">
							Aucune collection
						</Text>
						<Text className="text-text-secondary text-center">
							Les collections apparaîtront ici une fois que tu auras commencé à
							explorer.
						</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
