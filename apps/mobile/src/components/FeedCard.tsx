import { CardBase } from "@synap/shared";
import { Image } from "expo-image";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import { DimensionValue, Pressable, ScrollView, Text, View, Share, TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const CATEGORY_THEMES: Record<string, { label: string; color: string; emojis: string[] }> = {
	science: { label: "Sciences", color: "#4CC9F0", emojis: ["🧬", "🔬", "🔭", "⚛️"] },
	history: { label: "Histoire", color: "#F72585", emojis: ["📜", "🏺", "🏛️", "⚔️"] },
	art: { label: "Art", color: "#7209B7", emojis: ["🎨", "🎭", "🎻", "🖌️"] },
	nature: { label: "Nature", color: "#4361EE", emojis: ["🌿", "🌊", "🏔️", "🐾"] },
	tech: { label: "Tech", color: "#3A0CA3", emojis: ["💻", "🤖", "🚀", "📡"] },
	geography: { label: "Géographie", color: "#4895EF", emojis: ["🌍", "🗺️", "compass", "🌋"] },
	literature: { label: "Littérature", color: "#F48C06", emojis: ["📚", "✒️", "📖", "📜"] },
	philosophy: { label: "Philo", color: "#E0AFA0", emojis: ["🧠", "🤔", "💭", "🏛️"] },
	default: { label: "Découverte", color: "#FFD166", emojis: ["✨", "🧠", "💡", "🎲"] },
};

function getCategoryTheme(category?: string | null) {
	if (!category) return CATEGORY_THEMES.default;
	const key = Object.keys(CATEGORY_THEMES).find(
		(k) =>
			category.toLowerCase().includes(k.toLowerCase()) ||
			k.toLowerCase().includes(category.toLowerCase()),
	);
	return (
		CATEGORY_THEMES[key as keyof typeof CATEGORY_THEMES] || {
			...CATEGORY_THEMES.default,
			label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
		}
	);
}

export type FeedCardType = "discovery" | "review" | "quiz";

type FeedCardProps = {
	card: CardBase;
	cardType: FeedCardType;
	height: number;
	// For quiz mode
	distractors?: string[];
	onReview?: (cardId: string, rating: "forgot" | "retained") => void;
	onQuizAnswer?: (cardId: string, correct: boolean) => void;
	onLike?: (cardId: string) => void;
	onBookmark?: (cardId: string) => void;
};

export function FeedCard({
	card,
	cardType,
	height,
	distractors = [],
	onReview,
	onQuizAnswer,
	onLike,
	onBookmark,
}: FeedCardProps) {
	const insets = useSafeAreaInsets();
	const Gradient = LinearGradient as unknown as React.ComponentType<LinearGradientProps>;
	const rotation = useSharedValue(0);

	const [isFlipped, setIsFlipped] = useState(false);
	const [liked, setLiked] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);
	const [xpGained, setXpGained] = useState<number | null>(null);
	const [reviewSubmitted, setReviewSubmitted] = useState(false);
	const [quizAnswered, setQuizAnswered] = useState<string | null>(null);

	// Generate gradient color from title
	const gradientColors = useMemo(() => {
		let hash = 0;
		for (let i = 0; i < card.title.length; i++) {
			hash = card.title.charCodeAt(i) + ((hash << 5) - hash);
		}
		const hue = Math.abs(hash) % 360;
		return [`hsla(${hue}, 70%, 20%, 1)`, `hsla(${(hue + 40) % 360}, 60%, 15%, 1)`] as [
			string,
			string,
		];
	}, [card.title]);

	const categoryTheme = useMemo(() => getCategoryTheme(card.category), [card.category]);

	const backgroundEmojis = useMemo(() => {
		// Pick 3 random emojis from the set deterministically based on title
		const emojis = categoryTheme.emojis;
		const count = 3;
		const result: { emoji: string; style: TextStyle }[] = [];
		for (let i = 0; i < count; i++) {
			const index = (card.title.length + i) % emojis.length;
			result.push({
				emoji: emojis[index],
				style: {
					top: `${20 + i * 30}%` as DimensionValue,
					left: (i % 2 === 0 ? `${10 + i * 10}%` : undefined) as DimensionValue | undefined,
					right: (i % 2 !== 0 ? `${10 + i * 10}%` : undefined) as DimensionValue | undefined,
					transform: [{ rotate: `${i * 45 - 20}deg` }],
					opacity: 0.15,
					fontSize: 80 + i * 20,
					position: "absolute",
				},
			});
		}
		return result;
	}, [categoryTheme, card.title]);

	const hasImage = card.mediaUrl && card.mediaUrl.length > 0;
	const [imageError, setImageError] = useState(false);
	const showTextOnly = !hasImage || imageError;

	const showXpAnimation = useCallback((amount: number) => {
		setXpGained(amount);
		setTimeout(() => setXpGained(null), 2000);
	}, []);

	const toggle = useCallback(() => {
		const willFlip = rotation.value === 0;
		rotation.value = withSpring(willFlip ? 180 : 0, {
			damping: 12,
			stiffness: 140,
		});
		if (willFlip) {
			runOnJS(setIsFlipped)(true);
			// Show XP only for discovery (first view)
			if (cardType === "discovery") {
				runOnJS(showXpAnimation)(5);
			}
		} else {
			runOnJS(setIsFlipped)(false);
		}
	}, [rotation, cardType, showXpAnimation]);

	const handleReview = useCallback(
		(rating: "forgot" | "retained") => {
			if (reviewSubmitted) return;
			setReviewSubmitted(true);
			const xp = rating === "retained" ? 10 : 2;
			showXpAnimation(xp);
			onReview?.(card.id, rating);
		},
		[card.id, onReview, reviewSubmitted, showXpAnimation],
	);

	const handleQuizAnswer = useCallback(
		(answer: string, correct: string) => {
			if (quizAnswered) return;
			setQuizAnswered(answer);
			const isCorrect = answer === correct;
			if (isCorrect) {
				showXpAnimation(25);
			}
			onQuizAnswer?.(card.id, isCorrect);
		},
		[card.id, onQuizAnswer, quizAnswered, showXpAnimation],
	);

	const handleLike = useCallback(() => {
		setLiked(!liked);
		if (onLike && !liked) {
			onLike(card.id);
		}
	}, [liked, onLike, card.id]);

	const handleShare = useCallback(async () => {
		try {
			await Share.share({
				message: `${card.title}\n\n${card.summary}\n\nDécouvert sur SYNAP 🧠`,
				url: card.sourceLink ?? undefined,
			});
		} catch (error) {
			console.error("Share error:", error);
		}
	}, [card.title, card.summary, card.sourceLink]);

	const handleBookmark = useCallback(() => {
		setBookmarked(!bookmarked);
		onBookmark?.(card.id);
	}, [bookmarked, onBookmark, card.id]);

	const frontAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
		backfaceVisibility: "hidden",
	}));

	const backAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
		backfaceVisibility: "hidden",
	}));

	// Quiz answers - computed always to respect hooks rules
	const { allAnswers, correctAnswer } = useMemo(() => {
		if (cardType !== "quiz") return { allAnswers: [], correctAnswer: "" };

		// Use predefined quiz answers if available
		if (card.quizAnswers && card.quizAnswers.length >= 2) {
			const correctIdx = card.quizCorrectIndex ?? 0;
			const correct = card.quizAnswers[correctIdx];
			// Shuffle the predefined answers
			const shuffled = [...card.quizAnswers].sort(() => Math.random() - 0.5);
			return { allAnswers: shuffled, correctAnswer: correct };
		}

		// Fallback: use summary as correct answer + distractors
		const answers = [card.summary, ...distractors.slice(0, 3)];
		return {
			allAnswers: answers.sort(() => Math.random() - 0.5),
			correctAnswer: card.summary,
		};
	}, [cardType, card.summary, card.quizAnswers, card.quizCorrectIndex, distractors]);

	// ========== QUIZ MODE ==========
	if (cardType === "quiz") {
		return (
			<View style={{ height }} className="bg-synap-teal">
				<Gradient
					colors={gradientColors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{
						flex: 1,
						padding: 24,
						paddingTop: Math.max(24, insets.top),
						paddingBottom: Math.max(140, insets.bottom + 120),
					}}
				>
					{/* Quiz header */}
					<View className="flex-row items-center mb-6">
						<View className="bg-synap-gold/20 px-4 py-1 rounded-full">
							<Text className="text-synap-gold font-semibold text-sm">📝 QUIZ</Text>
						</View>
					</View>

					{/* Question */}
					<View className="flex-1 justify-center">
						<Text className="text-white/60 text-sm uppercase tracking-widest mb-3">
							Qu&apos;est-ce que...
						</Text>
						<Text className="text-white text-3xl font-bold mb-8">{card.title} ?</Text>

						{/* Answer options */}
						<View className="gap-3">
							{allAnswers.map((answer, index) => {
								const isCorrect = answer === correctAnswer;
								const isSelected = quizAnswered === answer;
								const showResult = quizAnswered !== null;

								let bgColor = "bg-synap-teal-medium/50 border-synap-teal-light";
								if (showResult && isCorrect) {
									bgColor = "bg-synap-emerald/30 border-synap-emerald";
								} else if (showResult && isSelected && !isCorrect) {
									bgColor = "bg-synap-pink/30 border-synap-pink";
								}

								return (
									<Pressable
										key={index}
										className={`p-4 rounded-xl border ${bgColor} ${
											!showResult ? "active:bg-synap-teal-medium" : ""
										}`}
										onPress={() => handleQuizAnswer(answer, correctAnswer)}
										disabled={quizAnswered !== null}
									>
										<View className="flex-row items-center gap-3">
											{showResult && isCorrect && (
												<Ionicons name="checkmark-circle" size={22} color="#06D6A0" />
											)}
											{showResult && isSelected && !isCorrect && (
												<Ionicons name="close-circle" size={22} color="#EF476F" />
											)}
											<Text
												className={`flex-1 ${
													showResult && isCorrect
														? "text-synap-emerald"
														: showResult && isSelected
														? "text-synap-pink"
														: "text-white"
												}`}
												numberOfLines={3}
											>
												{answer}
											</Text>
										</View>
									</Pressable>
								);
							})}
						</View>
					</View>
				</Gradient>

				{/* XP Animation */}
				{xpGained !== null && (
					<Animated.View
						className="absolute top-1/4 left-1/2 bg-synap-gold px-6 py-3 rounded-full"
						style={{ marginLeft: -50 }}
					>
						<Text className="text-synap-teal font-bold text-lg">+{xpGained} XP ⚡</Text>
					</Animated.View>
				)}
			</View>
		);
	}

	// ========== DISCOVERY / REVIEW MODE ==========
	const displayedContent = card.content ?? card.summary;

	return (
		<View style={{ height }} className="bg-synap-teal">
			{/* Front face */}
			<Animated.View style={[frontAnimatedStyle, { position: "absolute", inset: 0 }]}>
				<Pressable style={{ flex: 1 }} onPress={toggle}>
					{showTextOnly ? (
						<Gradient
							colors={gradientColors}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{
								flex: 1,
								padding: 24,
								paddingTop: Math.max(24, insets.top),
								paddingBottom: Math.max(140, insets.bottom + 120),
								justifyContent: "center",
							}}
						>
							<View className="absolute top-12 right-8 w-32 h-32 rounded-full bg-white/5" />
							<View className="absolute bottom-40 left-8 w-24 h-24 rounded-full bg-white/5" />

							{/* Background Emojis */}
							{backgroundEmojis.map((item, idx) => (
								<Text key={idx} style={[{ position: "absolute" }, item.style]}>
									{item.emoji}
								</Text>
							))}

							{cardType === "review" && (
								<View className="flex-row items-center mb-4">
									<View className="bg-synap-pink/20 px-3 py-1 rounded-full">
										<Text className="text-synap-pink font-semibold text-xs">🔔 À réviser</Text>
									</View>
								</View>
							)}

							<View className="flex-row items-center mb-6">
								<View
									className="flex-row items-center px-3 py-1 rounded-full border border-white/20"
									style={{ backgroundColor: `${categoryTheme.color}20` }}
								>
									<Text style={{ fontSize: 12, marginRight: 6 }}>{categoryTheme.emojis[0]}</Text>
									<Text
										className="font-bold text-xs uppercase tracking-wider"
										style={{ color: categoryTheme.color }}
									>
										{categoryTheme.label}
									</Text>
								</View>
							</View>
							<Text className="text-white text-4xl font-bold mb-6 leading-tight">{card.title}</Text>
							{/* Show summary only for discovery */}
							{cardType === "discovery" && (
								<Text className="text-white/80 text-lg leading-7">{card.summary}</Text>
							)}
							<View className="mt-8 flex-row items-center">
								<View className="h-2 w-2 rounded-full bg-synap-emerald mr-2" />
								<Text className="text-xs text-text-secondary">
									Touche pour {cardType === "review" ? "voir la réponse" : "retourner"}
								</Text>
							</View>
						</Gradient>
					) : (
						<>
							<Image
								source={{ uri: card.mediaUrl }}
								style={{ position: "absolute", inset: 0 }}
								contentFit="cover"
								transition={500}
								cachePolicy="memory-disk"
								onError={() => setImageError(true)}
							/>
							<Gradient
								colors={["rgba(7,59,76,0.1)", "rgba(7,59,76,0.9)"]}
								locations={[0.2, 1]}
								style={{
									flex: 1,
									padding: 24,
									paddingTop: Math.max(24, insets.top),
									paddingBottom: Math.max(140, insets.bottom + 120),
									justifyContent: "flex-end",
								}}
							>
								{cardType === "review" && (
									<View className="flex-row items-center mb-4">
										<View className="bg-synap-pink/20 px-3 py-1 rounded-full">
											<Text className="text-synap-pink font-semibold text-xs">🔔 À réviser</Text>
										</View>
									</View>
								)}
								<View className="flex-row items-center mb-4">
									<View
										className="flex-row items-center px-3 py-1 rounded-full border border-white/20"
										style={{ backgroundColor: `${categoryTheme.color}20` }}
									>
										<Text style={{ fontSize: 12, marginRight: 6 }}>{categoryTheme.emojis[0]}</Text>
										<Text
											className="font-bold text-xs uppercase tracking-wider"
											style={{ color: categoryTheme.color }}
										>
											{categoryTheme.label}
										</Text>
									</View>
								</View>
								<Text className="text-white text-3xl font-semibold mb-3">{card.title}</Text>
								{cardType === "discovery" && (
									<Text className="text-text-secondary text-base leading-6">{card.summary}</Text>
								)}
								<View className="mt-6 flex-row items-center">
									<View className="h-2 w-2 rounded-full bg-synap-emerald mr-2" />
									<Text className="text-xs text-text-secondary">
										Touche pour {cardType === "review" ? "voir la réponse" : "retourner"}
									</Text>
								</View>
							</Gradient>
						</>
					)}
				</Pressable>
			</Animated.View>

			{/* Back face */}
			<Animated.View style={[backAnimatedStyle, { position: "absolute", inset: 0 }]}>
				<Pressable style={{ flex: 1 }} onPress={toggle}>
					<Gradient colors={["#073B4C", "#0A5266"]} style={{ flex: 1 }}>
						<ScrollView
							contentContainerStyle={{
								padding: 24,
								paddingTop: Math.max(24, insets.top),
								paddingBottom: Math.max(200, insets.bottom + 180),
							}}
						>
							<View className="mb-4">
								<Text className="text-synap-emerald text-xs uppercase tracking-widest mb-2">
									DÉTAIL
								</Text>
								<Text className="text-white text-2xl font-semibold">{card.title}</Text>
							</View>
							<Text className="text-text-secondary text-base leading-7 mb-6">
								{displayedContent}
							</Text>
							{card.sourceLink && !card.sourceLink.startsWith("synap://") && (
								<View className="rounded-xl border border-synap-teal-light p-4 bg-synap-teal-medium">
									<Text className="text-synap-emerald font-semibold mb-1">Source</Text>
									<Text className="text-text-secondary text-sm" numberOfLines={2}>
										{card.sourceLink}
									</Text>
								</View>
							)}
						</ScrollView>
					</Gradient>
				</Pressable>
			</Animated.View>

			{/* HUD Overlay - Right side actions */}
			<View className="absolute right-4 items-center gap-6" style={{ bottom: insets.bottom + 140 }}>
				<Pressable className="items-center" onPress={handleLike}>
					<View
						className={`p-3 rounded-full ${liked ? "bg-synap-pink" : "bg-synap-teal-medium/80"}`}
					>
						<Ionicons
							name={liked ? "heart" : "heart-outline"}
							size={28}
							color={liked ? "#FFFFFF" : "#D4D4D8"}
						/>
					</View>
				</Pressable>
				<Pressable className="items-center" onPress={handleShare}>
					<View className="p-3 rounded-full bg-synap-teal-medium/80">
						<Ionicons name="share-outline" size={28} color="#D4D4D8" />
					</View>
				</Pressable>
				<Pressable className="items-center" onPress={handleBookmark}>
					<View
						className={`p-3 rounded-full ${
							bookmarked ? "bg-synap-gold" : "bg-synap-teal-medium/80"
						}`}
					>
						<Ionicons
							name={bookmarked ? "bookmark" : "bookmark-outline"}
							size={28}
							color={bookmarked ? "#073B4C" : "#D4D4D8"}
						/>
					</View>
				</Pressable>
			</View>

			{/* Review feedback - Discrete bottom bar (only for review cards after flip) */}
			{cardType === "review" && isFlipped && !reviewSubmitted && (
				<View
					className="absolute left-0 right-0 flex-row gap-4 px-6"
					style={{ bottom: insets.bottom + 100 }}
				>
					<Pressable
						className="flex-1 py-3 rounded-xl bg-synap-pink/20 border border-synap-pink flex-row items-center justify-center gap-2"
						onPress={() => handleReview("forgot")}
					>
						<Ionicons name="close-circle" size={20} color="#EF476F" />
						<Text className="text-synap-pink font-semibold">Oublié</Text>
					</Pressable>
					<Pressable
						className="flex-1 py-3 rounded-xl bg-synap-emerald/20 border border-synap-emerald flex-row items-center justify-center gap-2"
						onPress={() => handleReview("retained")}
					>
						<Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
						<Text className="text-synap-emerald font-semibold">Retenu</Text>
					</Pressable>
				</View>
			)}

			{/* XP Animation */}
			{xpGained !== null && (
				<Animated.View
					className="absolute top-1/3 left-1/2 bg-synap-gold px-6 py-3 rounded-full"
					style={{ marginLeft: -50 }}
				>
					<Text className="text-synap-teal font-bold text-lg">+{xpGained} XP ⚡</Text>
				</Animated.View>
			)}
		</View>
	);
}
