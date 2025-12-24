import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { useAuthStore } from "../../src/stores/useAuthStore";

// Generate activity data for the last 12 weeks
const generateActivityData = (streak: number) => {
	const data: { date: string; count: number }[] = [];
	const today = new Date();

	for (let i = 83; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		// Simulate some activity pattern based on streak
		let count = 0;
		if (i < streak) {
			count = Math.floor(Math.random() * 4) + 1;
		} else if (Math.random() > 0.6) {
			count = Math.floor(Math.random() * 3);
		}

		data.push({
			date: date.toISOString().split("T")[0],
			count,
		});
	}

	return data;
};

const getActivityColor = (count: number): string => {
	if (count === 0) return "#0A5266";
	if (count === 1) return "#065F46";
	if (count === 2) return "#059669";
	if (count === 3) return "#10B981";
	return "#06D6A0";
};

function ActivityHeatmap({ streak }: { streak: number }) {
	const activityData = generateActivityData(streak);
	const weeks: { date: string; count: number }[][] = [];

	for (let i = 0; i < activityData.length; i += 7) {
		weeks.push(activityData.slice(i, i + 7));
	}

	return (
		<View className="bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light">
			<Text className="text-white font-semibold mb-3">Activité (12 semaines)</Text>
			<View className="flex-row gap-1">
				{weeks.map((week, weekIndex) => (
					<View key={weekIndex} className="gap-1">
						{week.map((day, dayIndex) => (
							<View
								key={`${weekIndex}-${dayIndex}`}
								className="w-3 h-3 rounded-sm"
								style={{ backgroundColor: getActivityColor(day.count) }}
							/>
						))}
					</View>
				))}
			</View>
			<View className="flex-row items-center justify-end mt-3 gap-1">
				<Text className="text-text-tertiary text-xs mr-2">Moins</Text>
				{[0, 1, 2, 3, 4].map((level) => (
					<View
						key={level}
						className="w-3 h-3 rounded-sm"
						style={{ backgroundColor: getActivityColor(level) }}
					/>
				))}
				<Text className="text-text-tertiary text-xs ml-2">Plus</Text>
			</View>
		</View>
	);
}

function StatCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string | number;
	color: string;
}) {
	return (
		<View className="flex-1 bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light items-center">
			<Text className="text-3xl font-bold" style={{ color }}>
				{value}
			</Text>
			<Text className="text-text-secondary text-sm mt-1">{label}</Text>
		</View>
	);
}

export default function ProfileScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		await logout();
		router.replace("/landing" as Href);
	};

	// Calculate level from XP (simple formula: level = floor(sqrt(xp/100)) + 1)
	const xp = user?.xp ?? 0;
	const level = Math.floor(Math.sqrt(xp / 100)) + 1;
	const xpForNextLevel = Math.pow(level, 2) * 100;
	const xpProgress = (xp / xpForNextLevel) * 100;

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#073B4C" }}>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4">
					{/* Header */}
					<Text className="text-white text-2xl font-bold mb-6">
						{t("profile.title")}
					</Text>

					{/* User Card */}
					<View className="bg-synap-teal-medium rounded-2xl p-6 border border-synap-teal-light mb-6">
						<View className="flex-row items-center mb-4">
							<View className="h-20 w-20 rounded-full bg-synap-teal border-2 border-synap-emerald items-center justify-center overflow-hidden mr-4">
								{user?.avatarUrl ? (
									<Image
										source={{ uri: user.avatarUrl }}
										style={{ width: 80, height: 80 }}
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
								<View className="flex-row items-center">
									<View className="bg-synap-gold/20 px-3 py-1 rounded-full">
										<Text className="text-synap-gold font-semibold text-sm">
											Niveau {level}
										</Text>
									</View>
								</View>
							</View>
						</View>

						{/* XP Progress Bar */}
						<View className="mb-2">
							<View className="flex-row justify-between mb-1">
								<Text className="text-text-secondary text-xs">Expérience</Text>
								<Text className="text-text-secondary text-xs">
									{xp} / {xpForNextLevel} XP
								</Text>
							</View>
							<View className="h-2 bg-synap-teal rounded-full overflow-hidden">
								<View
									className="h-full bg-synap-gold rounded-full"
									style={{ width: `${Math.min(xpProgress, 100)}%` }}
								/>
							</View>
						</View>
					</View>

					{/* Stats Row */}
					<View className="flex-row gap-3 mb-6">
						<StatCard
							label={t("profile.streak")}
							value={`${user?.streak ?? 0}j`}
							color="#06D6A0"
						/>
						<StatCard label={t("profile.xp")} value={xp} color="#FFD166" />
						<StatCard label="Cartes" value="42" color="#118AB2" />
					</View>

					{/* Activity Heatmap */}
					<View className="mb-6">
						<ActivityHeatmap streak={user?.streak ?? 0} />
					</View>

					{/* Interests */}
					{user?.interests && user.interests.length > 0 && (
						<View className="mb-6">
							<Text className="text-white font-semibold mb-3">Centres d'intérêt</Text>
							<View className="flex-row flex-wrap gap-2">
								{user.interests.map((interest) => (
									<View
										key={interest}
										className="bg-synap-teal-light px-4 py-2 rounded-full"
									>
										<Text className="text-text-secondary text-sm">{interest}</Text>
									</View>
								))}
							</View>
						</View>
					)}

					{/* Settings Link */}
					<Pressable className="bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light flex-row items-center justify-between mb-4">
						<Text className="text-white font-medium">{t("settings.title")}</Text>
						<Text className="text-text-secondary">→</Text>
					</Pressable>

					{/* Logout Button */}
					<Pressable
						className="bg-synap-pink/20 border border-synap-pink py-4 rounded-xl active:bg-synap-pink/30 mb-8"
						onPress={handleLogout}
					>
						<Text className="text-synap-pink text-center font-semibold">
							{t("auth.logout")}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
