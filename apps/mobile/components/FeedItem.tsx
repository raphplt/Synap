import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	Pressable,
	Dimensions,
	StyleSheet,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	interpolate,
	withTiming,
	runOnJS,
} from "react-native-reanimated";
import { ICard } from "@memex/shared";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";

const { width, height } = Dimensions.get("window");
// Adjust this if you have a bottom tab bar height constant
const TAB_BAR_HEIGHT = 49 + 34; // Approx standard tab bar + safe area
const ITEM_HEIGHT = height - TAB_BAR_HEIGHT;

interface FeedItemProps {
	item: ICard;
	isVisible: boolean;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, isVisible }) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const spin = useSharedValue(0);
	const heartScale = useSharedValue(0);

	const handleFlip = () => {
		if (spin.value === 0) {
			spin.value = withSpring(1, { damping: 12 });
			setIsFlipped(true);
		} else {
			spin.value = withSpring(0, { damping: 12 });
			setIsFlipped(false);
		}
	};

	const handleDoubleTap = () => {
		heartScale.value = withSpring(1, {}, () => {
			heartScale.value = withTiming(0, { duration: 500 });
		});
	};

	const rFrontStyle = useAnimatedStyle(() => {
		const rotateValue = interpolate(spin.value, [0, 1], [0, 180]);
		return {
			transform: [{ rotateY: `${rotateValue}deg` }],
			opacity: spin.value < 0.5 ? 1 : 0,
			zIndex: spin.value < 0.5 ? 1 : 0,
		};
	});

	const rBackStyle = useAnimatedStyle(() => {
		const rotateValue = interpolate(spin.value, [0, 1], [180, 360]);
		return {
			transform: [{ rotateY: `${rotateValue}deg` }],
			opacity: spin.value > 0.5 ? 1 : 0,
			zIndex: spin.value > 0.5 ? 1 : 0,
		};
	});

	const rHeartStyle = useAnimatedStyle(() => ({
		transform: [{ scale: Math.max(heartScale.value, 0) }], // Ensure no negative scale
		opacity: heartScale.value,
	}));

	// Simple double tap implementation
	let lastTap = 0;
	const handleTouch = () => {
		const now = Date.now();
		const DOUBLE_PRESS_DELAY = 300;
		if (now - lastTap < DOUBLE_PRESS_DELAY) {
			handleDoubleTap();
		} else {
			handleFlip();
		}
		lastTap = now;
	};

	return (
		<Pressable
			onPress={handleTouch}
			style={{ height: ITEM_HEIGHT, width, backgroundColor: "#000" }}
		>
			{/* Front Face */}
			<Animated.View style={[styles.cardFace, rFrontStyle]}>
				<Image
					source={{ uri: item.mediaUrl }}
					style={StyleSheet.absoluteFillObject}
					resizeMode="cover"
				/>
				<LinearGradient
					colors={["transparent", "rgba(0,0,0,0.8)"]}
					style={StyleSheet.absoluteFillObject}
				/>
				<View className="absolute bottom-10 left-4 right-4 animate-fade-in-up">
					<View className="flex-row items-center mb-2">
						<View className="bg-primary/80 px-2 py-1 rounded-md mr-2">
							<Text className="text-white text-xs font-bold uppercase">
								{item.category}
							</Text>
						</View>
						<Text className="text-gray-300 text-xs">
							Difficulty: {item.difficultyLevel}/5
						</Text>
					</View>
					<Text className="text-white text-4xl font-bold leading-tight shadow-md mb-2">
						{item.title}
					</Text>
					<Text className="text-gray-200 text-base font-medium" numberOfLines={2}>
						{item.summary}
					</Text>
				</View>
			</Animated.View>

			{/* Back Face */}
			<Animated.View
				style={[styles.cardFace, rBackStyle, { backgroundColor: "#1a1a1a" }]}
			>
				<View className="flex-1 p-6 pt-16">
					<Text className="text-primary font-bold text-lg mb-2 uppercase tracking-widest">
						{item.type}
					</Text>
					<Text className="text-white text-3xl font-bold mb-6">{item.title}</Text>

					<View className="flex-1">
						<Markdown
							style={{
								body: { color: "white", fontSize: 16, lineHeight: 24 },
								heading1: {
									color: "white",
									fontSize: 24,
									fontWeight: "bold",
									marginBottom: 10,
								},
								code_block: { backgroundColor: "#333", padding: 10, borderRadius: 8 },
								link: { color: "#4da6ff" },
							}}
						>
							{item.content}
						</Markdown>
					</View>

					<View className="mt-4 flex-row flex-wrap">
						{item.tags.map((tag, i) => (
							<Text key={i} className="text-gray-400 text-xs mr-2 mb-2">
								#{tag}
							</Text>
						))}
					</View>
				</View>
			</Animated.View>

			{/* Heart Animation Overlay */}
			<View
				style={[
					StyleSheet.absoluteFillObject,
					{ justifyContent: "center", alignItems: "center" },
				]}
				pointerEvents="none"
			>
				<Animated.View style={rHeartStyle}>
					<Ionicons name="heart" size={100} color="white" />
				</Animated.View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	cardFace: {
		...StyleSheet.absoluteFillObject,
		backfaceVisibility: "hidden",
		overflow: "hidden",
	},
});
