import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withSequence,
} from "react-native-reanimated";
import { useQuizStore } from "../../src/stores/useQuizStore";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { getApiBaseUrl } from "../../src/lib/api";

async function fetchQuizCards(token: string) {
	// Fetch cards that need review (learning state)
	const response = await fetch(`${getApiBaseUrl()}/srs/learning`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		// Fallback: fetch from feed
		const feedResponse = await fetch(`${getApiBaseUrl()}/feed?limit=10`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!feedResponse.ok) throw new Error("Failed to fetch cards");
		return feedResponse.json();
	}
	const interactions = await response.json();
	return interactions.map((i: { card: unknown }) => i.card);
}

function IntroScreen({ onStart }: { onStart: () => void }) {
	const { t } = useTranslation();
	const scale = useSharedValue(1);

	useEffect(() => {
		scale.value = withSequence(
			withSpring(1.1, { damping: 8 }),
			withSpring(1, { damping: 12 })
		);
	}, [scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View className="flex-1 items-center justify-center px-8">
			<Animated.View style={animatedStyle} className="mb-8">
				<Text className="text-6xl">🧠</Text>
			</Animated.View>
			<Text className="text-white text-3xl font-bold mb-4 text-center">
				{t("quiz.ready", "Prêt à réviser ?")}
			</Text>
			<Text className="text-text-secondary text-center mb-8">
				{t("quiz.intro", "10 cartes pour tester ta mémoire. Concentre-toi !")}
			</Text>
			<Pressable
				className="bg-synap-emerald py-4 px-12 rounded-xl active:bg-synap-emerald/80"
				onPress={onStart}
			>
				<Text className="text-synap-teal font-bold text-lg">
					{t("quiz.start", "Commencer")}
				</Text>
			</Pressable>
		</View>
	);
}

function QuestionScreen({
	cardTitle,
	onReveal,
	progress,
}: {
	cardTitle: string;
	onReveal: () => void;
	progress: { current: number; total: number };
}) {
	const { t } = useTranslation();

	return (
		<View className="flex-1 px-6">
			{/* Progress bar */}
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-text-secondary">
					{progress.current} / {progress.total}
				</Text>
				<View className="flex-1 mx-4 h-2 bg-synap-teal-light rounded-full">
					<View
						className="h-full bg-synap-emerald rounded-full"
						style={{ width: `${(progress.current / progress.total) * 100}%` }}
					/>
				</View>
			</View>

			{/* Question */}
			<View className="flex-1 justify-center">
				<Text className="text-synap-gold text-sm uppercase tracking-widest mb-4 text-center">
					{t("quiz.remember", "Te souviens-tu de...")}
				</Text>
				<View className="bg-synap-teal-medium rounded-2xl p-8 border border-synap-teal-light">
					<Text className="text-white text-2xl font-bold text-center leading-relaxed">
						{cardTitle}
					</Text>
				</View>
			</View>

			{/* Reveal button */}
			<Pressable
				className="bg-synap-teal-light py-4 rounded-xl mb-24 active:bg-synap-teal-medium"
				onPress={onReveal}
			>
				<Text className="text-white font-semibold text-center text-lg">
					{t("quiz.reveal", "Révéler la réponse")}
				</Text>
			</Pressable>
		</View>
	);
}

function RevealScreen({
	cardTitle,
	cardSummary,
	onAnswer,
}: {
	cardTitle: string;
	cardSummary: string;
	onAnswer: (answer: "FORGOT" | "RETAINED") => void;
}) {
	const { t } = useTranslation();
	const [answered, setAnswered] = useState<"FORGOT" | "RETAINED" | null>(null);

	const handleAnswer = (answer: "FORGOT" | "RETAINED") => {
		setAnswered(answer);
		setTimeout(() => onAnswer(answer), 300);
	};

	return (
		<View className="flex-1 px-6">
			{/* Answer */}
			<View className="flex-1 justify-center">
				<Text className="text-synap-emerald text-sm uppercase tracking-widest mb-4 text-center">
					{t("quiz.answer", "Réponse")}
				</Text>
				<View className="bg-synap-teal-medium rounded-2xl p-8 border border-synap-emerald mb-4">
					<Text className="text-white text-xl font-bold text-center mb-4">
						{cardTitle}
					</Text>
					<Text className="text-text-secondary text-center leading-relaxed">
						{cardSummary}
					</Text>
				</View>
			</View>

			{/* Answer buttons */}
			<View className="flex-row gap-4 mb-24">
				<Pressable
					className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${
						answered === "FORGOT"
							? "bg-synap-pink"
							: "bg-synap-pink/20 border border-synap-pink"
					}`}
					onPress={() => handleAnswer("FORGOT")}
					disabled={answered !== null}
				>
					<Ionicons name="close-circle" size={24} color="#EF476F" />
					<Text
						className={`font-semibold text-lg ${
							answered === "FORGOT" ? "text-white" : "text-synap-pink"
						}`}
					>
						{t("quiz.forgot", "Oublié")}
					</Text>
				</Pressable>
				<Pressable
					className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${
						answered === "RETAINED"
							? "bg-synap-emerald"
							: "bg-synap-emerald/20 border border-synap-emerald"
					}`}
					onPress={() => handleAnswer("RETAINED")}
					disabled={answered !== null}
				>
					<Ionicons name="checkmark-circle" size={24} color="#06D6A0" />
					<Text
						className={`font-semibold text-lg ${
							answered === "RETAINED" ? "text-synap-teal" : "text-synap-emerald"
						}`}
					>
						{t("quiz.retained", "Retenu")}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

function ResultScreen({
	score,
	total,
	xpEarned,
	onRestart,
	onClose,
}: {
	score: number;
	total: number;
	xpEarned: number;
	onRestart: () => void;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const percentage = Math.round((score / total) * 100);

	const getResultEmoji = () => {
		if (percentage >= 80) return "🎉";
		if (percentage >= 50) return "💪";
		return "📚";
	};

	const getResultMessage = () => {
		if (percentage >= 80) return t("quiz.excellent", "Excellent !");
		if (percentage >= 50) return t("quiz.good", "Bien joué !");
		return t("quiz.keepLearning", "Continue d'apprendre !");
	};

	return (
		<View className="flex-1 items-center justify-center px-8">
			<Text className="text-6xl mb-4">{getResultEmoji()}</Text>
			<Text className="text-white text-3xl font-bold mb-2">
				{getResultMessage()}
			</Text>
			<Text className="text-synap-gold text-xl font-semibold mb-6">
				{score} / {total} ({percentage}%)
			</Text>

			{/* XP earned */}
			<View className="bg-synap-gold/20 px-6 py-3 rounded-full mb-8">
				<Text className="text-synap-gold font-bold text-lg">+{xpEarned} XP ⚡</Text>
			</View>

			{/* Actions */}
			<View className="w-full gap-3">
				<Pressable
					className="bg-synap-emerald py-4 rounded-xl active:bg-synap-emerald/80"
					onPress={onRestart}
				>
					<Text className="text-synap-teal font-bold text-center text-lg">
						{t("quiz.restart", "Recommencer")}
					</Text>
				</Pressable>
				<Pressable
					className="bg-synap-teal-light py-4 rounded-xl active:bg-synap-teal-medium"
					onPress={onClose}
				>
					<Text className="text-white font-semibold text-center">
						{t("quiz.close", "Fermer")}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function QuizScreen() {
	const { t } = useTranslation();
	const token = useAuthStore((state) => state.token);
	const {
		state,
		score,
		xpEarned,
		getCurrentCard,
		getProgress,
		startQuiz,
		revealAnswer,
		answerCard,
		resetQuiz,
	} = useQuizStore();

	const {
		data: cards,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["quiz-cards", token],
		queryFn: () => fetchQuizCards(token!),
		enabled: !!token,
	});

	const handleStart = useCallback(() => {
		if (cards && cards.length > 0) {
			startQuiz(cards);
		}
	}, [cards, startQuiz]);

	const handleRestart = useCallback(() => {
		resetQuiz();
		refetch().then(({ data }) => {
			if (data && data.length > 0) {
				startQuiz(data);
			}
		});
	}, [resetQuiz, refetch, startQuiz]);

	const handleClose = useCallback(() => {
		resetQuiz();
	}, [resetQuiz]);

	const currentCard = getCurrentCard();
	const progress = getProgress();

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator color="#06D6A0" size="large" />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
			{/* Header */}
			<View className="px-4 py-2 flex-row items-center justify-between">
				<Text className="text-white text-xl font-bold">
					{t("quiz.title", "Quiz")}
				</Text>
				{state !== "IDLE" && state !== "RESULT" && (
					<Pressable onPress={handleClose} className="p-2">
						<Ionicons name="close" size={24} color="#A0AEC0" />
					</Pressable>
				)}
			</View>

			{/* Content based on state */}
			{state === "IDLE" && <IntroScreen onStart={handleStart} />}

			{state === "INTRO" && (
				<View className="flex-1 items-center justify-center">
					<Text className="text-4xl mb-4">⏳</Text>
					<Text className="text-white text-xl">
						{t("quiz.loading", "Préparation...")}
					</Text>
				</View>
			)}

			{state === "QUESTION" && currentCard && (
				<QuestionScreen
					cardTitle={currentCard.title}
					onReveal={revealAnswer}
					progress={progress}
				/>
			)}

			{state === "REVEAL" && currentCard && (
				<RevealScreen
					cardTitle={currentCard.title}
					cardSummary={currentCard.summary}
					onAnswer={answerCard}
				/>
			)}

			{state === "RESULT" && (
				<ResultScreen
					score={score}
					total={progress.total}
					xpEarned={xpEarned}
					onRestart={handleRestart}
					onClose={handleClose}
				/>
			)}
		</SafeAreaView>
	);
}
