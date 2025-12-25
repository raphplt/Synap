import { CardBase } from "@synap/shared";
import { Image } from "expo-image";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

type CardItemProps = {
	card: CardBase;
	height: number;
	onFlip?: (cardId: string) => void;
	onLike?: (cardId: string) => void;
	onBookmark?: (cardId: string) => void;
};

export function CardItem({
	card,
	height,
	onFlip,
	onLike,
	onBookmark,
}: CardItemProps) {
	const insets = useSafeAreaInsets();
	const Gradient =
		LinearGradient as unknown as React.ComponentType<LinearGradientProps>;
	const rotation = useSharedValue(0);
	const [liked, setLiked] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);
	const [xpGained, setXpGained] = useState(false);

	const handleFlipComplete = useCallback(() => {
		setXpGained(true);
		if (onFlip) {
			onFlip(card.id);
		}
		// Hide XP animation after 2 seconds
		setTimeout(() => setXpGained(false), 2000);
	}, [card.id, onFlip]);

	const toggle = useCallback(() => {
		const willFlip = rotation.value === 0;
		rotation.value = withSpring(willFlip ? 180 : 0, {
			damping: 12,
			stiffness: 140,
		});
		if (willFlip) {
			runOnJS(handleFlipComplete)();
		}
	}, [rotation, handleFlipComplete]);

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
			// if (result.action === Share.sharedAction) {
			// 	Alert.alert("Partagé !", "Merci de partager SYNAP 🎉");
			// }
		} catch (error) {
			console.error("Share error:", error);
		}
	}, [card.title, card.summary, card.sourceLink]);

	const handleBookmark = useCallback(() => {
		setBookmarked(!bookmarked);
		if (onBookmark && !bookmarked) {
			onBookmark(card.id);
		}
		if (!bookmarked) {
			Alert.alert("Sauvegardé !", "Cette carte a été ajoutée à ta collection.");
		}
	}, [bookmarked, onBookmark, card.id]);

	const frontAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
		backfaceVisibility: "hidden",
	}));

	const backAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
		backfaceVisibility: "hidden",
	}));

	const displayedContent = useMemo(
		() => card.content ?? card.summary,
		[card.content, card.summary]
	);

	// Generate a gradient based on card title for text-only cards
	const getTextOnlyGradient = useMemo(() => {
		// Hash the title to get consistent colors
		let hash = 0;
		for (let i = 0; i < card.title.length; i++) {
			hash = card.title.charCodeAt(i) + ((hash << 5) - hash);
		}
		const hue = Math.abs(hash) % 360;
		return [
			`hsla(${hue}, 70%, 20%, 1)`,
			`hsla(${(hue + 40) % 360}, 60%, 15%, 1)`,
		];
	}, [card.title]);

	const hasImage = card.mediaUrl && card.mediaUrl.length > 0;
	const [imageError, setImageError] = useState(false);
	const showTextOnly = !hasImage || imageError;

	return (
		<View style={{ height }} className="bg-synap-teal">
			{/* Front face */}
			<Animated.View
				style={[frontAnimatedStyle, { position: "absolute", inset: 0 }]}
			>
				<Pressable style={{ flex: 1 }} onPress={toggle}>
					{showTextOnly ? (
						// Text-only fallback with gradient background
						<Gradient
							colors={getTextOnlyGradient as [string, string]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{
								flex: 1,
								padding: 24,
								paddingTop: Math.max(24, insets.top),
								paddingBottom: Math.max(100, insets.bottom + 80),
								justifyContent: "center",
							}}
						>
							{/* Abstract decoration */}
							<View className="absolute top-12 right-8 w-32 h-32 rounded-full bg-white/5" />
							<View className="absolute bottom-40 left-8 w-24 h-24 rounded-full bg-white/5" />

							<View className="flex-row items-center mb-6">
								<View className="h-2 w-12 rounded-full bg-synap-gold mr-3" />
								<Text className="text-text-secondary text-xs uppercase tracking-widest">
									SYNAP
								</Text>
							</View>
							<Text className="text-white text-4xl font-bold mb-6 leading-tight">
								{card.title}
							</Text>
							<Text className="text-white/80 text-lg leading-7">{card.summary}</Text>
							<View className="mt-8 flex-row items-center">
								<View className="h-2 w-2 rounded-full bg-synap-emerald mr-2" />
								<Text className="text-xs text-text-secondary">
									Touche pour retourner
								</Text>
							</View>
						</Gradient>
					) : (
						// Normal card with image
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
									paddingBottom: Math.max(100, insets.bottom + 80),
									justifyContent: "flex-end",
								}}
							>
								<View className="flex-row items-center mb-4">
									<View className="h-2 w-12 rounded-full bg-synap-gold mr-3" />
									<Text className="text-text-secondary text-xs uppercase tracking-widest">
										SYNAP
									</Text>
								</View>
								<Text className="text-white text-3xl font-semibold mb-3">
									{card.title}
								</Text>
								<Text className="text-text-secondary text-base leading-6">
									{card.summary}
								</Text>
								<View className="mt-6 flex-row items-center">
									<View className="h-2 w-2 rounded-full bg-synap-emerald mr-2" />
									<Text className="text-xs text-text-secondary">
										Touche pour retourner
									</Text>
								</View>
							</Gradient>
						</>
					)}
				</Pressable>
			</Animated.View>

			{/* Back face */}
			<Animated.View
				style={[backAnimatedStyle, { position: "absolute", inset: 0 }]}
			>
				<Pressable style={{ flex: 1 }} onPress={toggle}>
					<Gradient colors={["#073B4C", "#0A5266"]} style={{ flex: 1 }}>
						<ScrollView
							contentContainerStyle={{
								padding: 24,
								paddingTop: Math.max(24, insets.top),
								paddingBottom: Math.max(120, insets.bottom + 100),
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
			<View
				className="absolute right-4 items-center gap-6"
				style={{ bottom: insets.bottom + 100 }}
			>
				{/* Like button */}
				<Pressable className="items-center" onPress={handleLike}>
					<View
						className={`p-3 rounded-full ${
							liked ? "bg-synap-pink" : "bg-synap-teal-medium/80"
						}`}
					>
						<Ionicons
							name={liked ? "heart" : "heart-outline"}
							size={28}
							color={liked ? "#FFFFFF" : "#D4D4D8"}
						/>
					</View>
					<Text className="text-text-secondary text-xs mt-1">J&apos;aime</Text>
				</Pressable>

				{/* Share button */}
				<Pressable className="items-center" onPress={handleShare}>
					<View className="p-3 rounded-full bg-synap-teal-medium/80">
						<Ionicons name="share-outline" size={28} color="#D4D4D8" />
					</View>
					<Text className="text-text-secondary text-xs mt-1">Partager</Text>
				</Pressable>

				{/* Bookmark button */}
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
					<Text className="text-text-secondary text-xs mt-1">Sauver</Text>
				</Pressable>
			</View>

			{/* XP Gain popup */}
			{xpGained && (
				<Animated.View
					className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-synap-gold px-6 py-3 rounded-full"
					style={{ marginLeft: -50 }}
				>
					<Text className="text-synap-teal font-bold text-lg">+10 XP ⚡</Text>
				</Animated.View>
			)}
		</View>
	);
}
