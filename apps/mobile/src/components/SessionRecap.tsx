import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useEffect } from "react";

export interface SessionStats {
	cardsViewed: number;
	cardsRetained: number;
	cardsForgot: number;
	xpEarned: number;
	streak: number;
}

interface SessionRecapProps {
	visible: boolean;
	stats: SessionStats;
	onContinue: () => void;
	onFinish: () => void;
}

export function SessionRecap({ visible, stats, onContinue, onFinish }: SessionRecapProps) {
	const scale = useSharedValue(0.8);
	const opacity = useSharedValue(0);

	useEffect(() => {
		if (visible) {
			scale.value = withSpring(1, { damping: 12, stiffness: 200 });
			opacity.value = withSpring(1);
		} else {
			scale.value = 0.8;
			opacity.value = 0;
		}
	}, [visible, scale, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	const accuracy =
		stats.cardsRetained + stats.cardsForgot > 0
			? Math.round((stats.cardsRetained / (stats.cardsRetained + stats.cardsForgot)) * 100)
			: 0;

	const getEmoji = () => {
		if (accuracy >= 80) return "🎉";
		if (accuracy >= 50) return "💪";
		if (stats.cardsViewed >= 10) return "📚";
		return "🧠";
	};

	const getMessage = () => {
		if (accuracy >= 80) return "Session parfaite !";
		if (accuracy >= 50) return "Bien joué !";
		if (stats.cardsViewed >= 10) return "Session terminée";
		return "Pause ?";
	};

	return (
		<Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
			<View style={{ flex: 1, backgroundColor: "rgba(7, 59, 76, 0.9)" }}>
				<View className="flex-1 items-center justify-center px-6">
					<Animated.View
						style={animatedStyle}
						className="bg-synap-teal-medium rounded-3xl p-8 w-full max-w-sm border border-synap-teal-light shadow-2xl"
					>
						{/* Header */}
						<View className="items-center mb-6">
							<Text className="text-6xl mb-4">{getEmoji()}</Text>
							<Text className="text-white text-2xl font-bold text-center">{getMessage()}</Text>
						</View>

						{/* Stats Grid */}
						<View className="bg-synap-teal rounded-2xl p-4 mb-6">
							<View className="flex-row justify-between mb-4">
								<StatItem
									icon="eye"
									value={stats.cardsViewed}
									label="Cartes vues"
									color="#118AB2"
								/>
								<StatItem
									icon="checkmark-circle"
									value={stats.cardsRetained}
									label="Retenues"
									color="#06D6A0"
								/>
								<StatItem
									icon="close-circle"
									value={stats.cardsForgot}
									label="Oubliées"
									color="#EF476F"
								/>
							</View>

							{/* XP Bar */}
							<View className="bg-synap-teal-dark rounded-xl p-3 flex-row items-center justify-between">
								<View className="flex-row items-center">
									<Text className="text-synap-gold text-xl mr-2">⚡</Text>
									<Text className="text-synap-gold font-bold text-lg">+{stats.xpEarned} XP</Text>
								</View>
								{stats.streak > 0 && (
									<View className="bg-synap-emerald/20 px-3 py-1 rounded-full">
										<Text className="text-synap-emerald font-semibold text-sm">
											🔥 {stats.streak}j
										</Text>
									</View>
								)}
							</View>
						</View>

						{/* Accuracy */}
						{stats.cardsRetained + stats.cardsForgot > 0 && (
							<View className="items-center mb-6">
								<Text className="text-text-secondary text-sm mb-1">Taux de rétention</Text>
								<Text
									className={`text-3xl font-bold ${
										accuracy >= 80
											? "text-synap-emerald"
											: accuracy >= 50
											? "text-synap-gold"
											: "text-synap-pink"
									}`}
								>
									{accuracy}%
								</Text>
							</View>
						)}

						{/* Actions */}
						<View className="gap-3">
							<Pressable
								className="bg-synap-emerald py-4 rounded-xl active:bg-synap-emerald/80"
								onPress={onContinue}
							>
								<Text className="text-synap-teal font-bold text-center text-lg">
									Encore 10 cartes 🚀
								</Text>
							</Pressable>
							<Pressable
								className="bg-synap-teal-light py-4 rounded-xl active:bg-synap-teal-medium"
								onPress={onFinish}
							>
								<Text className="text-white font-semibold text-center">Terminer la session</Text>
							</Pressable>
						</View>
					</Animated.View>
				</View>
			</View>
		</Modal>
	);
}

function StatItem({
	icon,
	value,
	label,
	color,
}: {
	icon: string;
	value: number;
	label: string;
	color: string;
}) {
	return (
		<View className="items-center flex-1">
			<Ionicons name={icon as any} size={24} color={color} />
			<Text className="text-white text-xl font-bold mt-1">{value}</Text>
			<Text className="text-text-tertiary text-xs">{label}</Text>
		</View>
	);
}
