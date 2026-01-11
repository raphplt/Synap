import { View, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

interface ProfileHeaderProps {
	user: {
		username?: string;
		email?: string;
		avatarUrl?: string | null;
	} | null;
	xpStats: {
		xp: number;
		level: number;
		xpForNextLevel: number;
		progress: number;
	};
	isLoading?: boolean;
}

function getLevelColor(level: number): string {
	if (level >= 31) return "#FFD166"; // Gold - Expert
	if (level >= 16) return "#06D6A0"; // Emerald - Connaisseur
	if (level >= 6) return "#118AB2"; // Blue - Apprenti
	return "#A0AEC0"; // Gray - Débutant
}

function getLevelTitle(level: number): string {
	if (level >= 31) return "Expert";
	if (level >= 16) return "Connaisseur";
	if (level >= 6) return "Apprenti";
	return "Débutant";
}

export function ProfileHeader({
	user,
	xpStats,
	isLoading,
}: ProfileHeaderProps) {
	const { xp, level, xpForNextLevel, progress } = xpStats;
	const levelColor = getLevelColor(level);

	return (
		<View className="bg-synap-teal-medium rounded-2xl p-6 border border-synap-teal-light mb-6 shadow-sm">
			<View className="flex-row items-center mb-4">
				<View
					className="h-20 w-20 rounded-full border-2 items-center justify-center overflow-hidden mr-4 bg-synap-teal-dark"
					style={{ borderColor: levelColor }}
				>
					{user?.avatarUrl ? (
						<Image
							source={{ uri: user.avatarUrl }}
							style={{ width: 80, height: 80 }}
							contentFit="cover"
						/>
					) : (
						<Text className="text-4xl">🧠</Text>
					)}
				</View>
				<View className="flex-1">
					<Text className="text-white text-xl font-bold">
						{user?.username ?? "Synaper"}
					</Text>
					<Text className="text-text-secondary text-sm mb-2">{user?.email}</Text>
					<View className="flex-row items-center gap-2">
						<View
							className="px-3 py-1 rounded-full"
							style={{ backgroundColor: `${levelColor}20` }}
						>
							<Text
								style={{ color: levelColor }}
								className="font-semibold text-sm"
							>
								Niveau {level}
							</Text>
						</View>
						<Text className="text-text-tertiary text-xs">
							{getLevelTitle(level)}
						</Text>
					</View>
				</View>
			</View>

			{/* XP Progress Bar */}
			{isLoading ? (
				<ActivityIndicator color="#06D6A0" size="small" />
			) : (
				<View className="mb-2">
					<View className="flex-row justify-between mb-1">
						<Text className="text-text-secondary text-xs font-medium">
							Expérience
						</Text>
						<Text className="text-text-secondary text-xs">
							{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
						</Text>
					</View>
					<View className="h-2 bg-synap-teal-dark rounded-full overflow-hidden">
						<View
							className="h-full rounded-full"
							style={{
								width: `${Math.min(progress * 100, 100)}%`,
								backgroundColor: levelColor,
							}}
						/>
					</View>
				</View>
			)}
		</View>
	);
}
