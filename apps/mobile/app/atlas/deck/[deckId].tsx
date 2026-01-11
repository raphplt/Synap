import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import { getApiBaseUrl } from "../../../src/lib/api";

interface DeckDetail {
	id: string;
	name: string;
	slug: string;
	description: string;
	totalCards: number;
	masteredCards: number;
	goldCards: number;
	progressPercent: number;
	categoryName?: string | null;
}

interface DeckCard {
	id: string;
	title: string;
	summary: string;
	mediaUrl: string;
	status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | "GOLD";
	lastReviewedAt: string | null;
}

async function fetchDeckDetail(token: string, deckId: string): Promise<DeckDetail> {
	const response = await fetch(`${getApiBaseUrl()}/atlas/deck/${deckId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch deck");
	return response.json();
}

async function fetchDeckCards(token: string, deckId: string): Promise<DeckCard[]> {
	const response = await fetch(`${getApiBaseUrl()}/atlas/deck/${deckId}/cards`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch cards");
	return response.json();
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
	NEW: { bg: "bg-synap-teal-light", text: "text-white", label: "Nouveau" },
	LEARNING: { bg: "bg-synap-blue", text: "text-white", label: "En cours" },
	REVIEW: { bg: "bg-synap-gold/20", text: "text-synap-gold", label: "À revoir" },
	MASTERED: { bg: "bg-synap-emerald/20", text: "text-synap-emerald", label: "Maîtrisé" },
	GOLD: { bg: "bg-synap-gold", text: "text-synap-teal", label: "Gold ⭐" },
};

function CardItem({ card }: { card: DeckCard }) {
	const statusStyle = STATUS_COLORS[card.status] || STATUS_COLORS.NEW;

	return (
		<Pressable className="bg-synap-teal-medium rounded-xl p-4 mb-3 border border-synap-teal-light active:bg-synap-teal-light">
			<View className="flex-row items-start justify-between">
				<View className="flex-1 mr-3">
					<Text className="text-white font-semibold text-base" numberOfLines={2}>
						{card.title}
					</Text>
					<Text className="text-text-secondary text-sm mt-1" numberOfLines={2}>
						{card.summary}
					</Text>
				</View>
				<View className={`${statusStyle.bg} px-2 py-1 rounded-lg`}>
					<Text className={`${statusStyle.text} text-xs font-medium`}>{statusStyle.label}</Text>
				</View>
			</View>
		</Pressable>
	);
}

export default function DeckDetailScreen() {
	const router = useRouter();
	const { deckId } = useLocalSearchParams<{ deckId: string }>();
	const token = useAuthStore((state) => state.token);

	const { data: deck, isLoading: deckLoading } = useQuery({
		queryKey: ["deck-detail", deckId],
		queryFn: () => fetchDeckDetail(token!, deckId!),
		enabled: !!token && !!deckId,
	});

	const { data: cards, isLoading: cardsLoading } = useQuery({
		queryKey: ["deck-cards", deckId],
		queryFn: () => fetchDeckCards(token!, deckId!),
		enabled: !!token && !!deckId,
	});

	const isLoading = deckLoading || cardsLoading;

	// Group cards by status
	const groupedCards = {
		learning: cards?.filter((c) => c.status === "LEARNING" || c.status === "REVIEW") ?? [],
		mastered: cards?.filter((c) => c.status === "MASTERED" || c.status === "GOLD") ?? [],
		new: cards?.filter((c) => c.status === "NEW") ?? [],
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
			<View className="flex-1">
				{/* Header */}
				<View className="flex-row items-center p-4 border-b border-synap-teal-light">
					<Pressable onPress={() => router.back()} className="mr-4 p-2 -ml-2">
						<Ionicons name="arrow-back" size={24} color="white" />
					</Pressable>
					<View className="flex-1">
						<Text className="text-white text-xl font-bold" numberOfLines={1}>
							{deck?.name ?? "Deck"}
						</Text>
						{deck?.categoryName && (
							<Text className="text-text-secondary text-sm">{deck.categoryName}</Text>
						)}
					</View>
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator color="#06D6A0" size="large" />
					</View>
				) : (
					<ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
						{/* Progress Section */}
						{deck && (
							<View className="bg-synap-teal-medium rounded-2xl p-4 mb-6 border border-synap-teal-light">
								<View className="flex-row justify-between mb-3">
									<Text className="text-white font-semibold">Progression</Text>
									<Text className="text-synap-emerald font-bold">{deck.progressPercent}%</Text>
								</View>
								<View className="bg-synap-teal-dark rounded-full h-3 overflow-hidden">
									<View
										className="bg-synap-emerald h-full rounded-full"
										style={{ width: `${deck.progressPercent}%` }}
									/>
								</View>
								<View className="flex-row justify-between mt-3">
									<Text className="text-text-tertiary text-xs">
										{deck.masteredCards}/{deck.totalCards} maîtrisées
									</Text>
									{deck.goldCards > 0 && (
										<Text className="text-synap-gold text-xs">⭐ {deck.goldCards} gold</Text>
									)}
								</View>
							</View>
						)}

						{/* Learning Cards */}
						{groupedCards.learning.length > 0 && (
							<View className="mb-6">
								<Text className="text-synap-gold font-semibold mb-3">
									📚 En apprentissage ({groupedCards.learning.length})
								</Text>
								{groupedCards.learning.map((card) => (
									<CardItem key={card.id} card={card} />
								))}
							</View>
						)}

						{/* New Cards */}
						{groupedCards.new.length > 0 && (
							<View className="mb-6">
								<Text className="text-synap-blue font-semibold mb-3">
									✨ Nouvelles cartes ({groupedCards.new.length})
								</Text>
								{groupedCards.new.map((card) => (
									<CardItem key={card.id} card={card} />
								))}
							</View>
						)}

						{/* Mastered Cards */}
						{groupedCards.mastered.length > 0 && (
							<View className="mb-6">
								<Text className="text-synap-emerald font-semibold mb-3">
									🏆 Maîtrisées ({groupedCards.mastered.length})
								</Text>
								{groupedCards.mastered.map((card) => (
									<CardItem key={card.id} card={card} />
								))}
							</View>
						)}

						{/* Empty State */}
						{cards?.length === 0 && (
							<View className="items-center justify-center py-12">
								<Text className="text-4xl mb-4">📭</Text>
								<Text className="text-white text-lg font-semibold">Aucune carte</Text>
								<Text className="text-text-secondary text-center">
									Ce deck ne contient pas encore de cartes.
								</Text>
							</View>
						)}

						<View className="h-8" />
					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
}
