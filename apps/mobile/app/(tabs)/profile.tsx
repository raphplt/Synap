import {
	View,
	Text,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { getApiBaseUrl } from "../../src/lib/api";

interface XpStats {
	global: {
		xp: number;
		level: number;
		xpForNextLevel: number;
		progress: number;
	};
	streak: {
		current: number;
		multiplier: number;
	};
	byCategory: Array<{
		categoryId: string;
		categoryName: string;
		xp: number;
		level: number;
		cardsCompleted: number;
		cardsGold: number;
	}>;
}

interface HeatmapData {
	date: string;
	count: number;
}

async function fetchXpStats(token: string): Promise<XpStats> {
	const response = await fetch(`${getApiBaseUrl()}/gamification/stats`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch XP stats");
	return response.json();
}

async function fetchHeatmap(token: string): Promise<HeatmapData[]> {
	const response = await fetch(`${getApiBaseUrl()}/gamification/heatmap`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch heatmap");
	return response.json();
}

const getActivityColor = (count: number): string => {
	if (count === 0) return "#0A5266";
	if (count === 1) return "#065F46";
	if (count === 2) return "#059669";
	if (count === 3) return "#10B981";
	return "#06D6A0";
};

function ActivityHeatmap({ data }: { data: HeatmapData[] }) {
	// Fill in missing days for last 12 weeks
	const filledData: HeatmapData[] = [];
	const today = new Date();
	const dataMap = new Map(data.map((d) => [d.date, d.count]));

	for (let i = 83; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split("T")[0];
		filledData.push({
			date: dateStr,
			count: dataMap.get(dateStr) ?? 0,
		});
	}

	const weeks: HeatmapData[][] = [];
	for (let i = 0; i < filledData.length; i += 7) {
		weeks.push(filledData.slice(i, i + 7));
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
	subtitle,
}: {
	label: string;
	value: string | number;
	color: string;
	subtitle?: string;
}) {
	return (
		<View className="flex-1 bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light items-center">
			<Text className="text-3xl font-bold" style={{ color }}>
				{value}
			</Text>
			<Text className="text-text-secondary text-sm mt-1">{label}</Text>
			{subtitle && <Text className="text-text-tertiary text-xs">{subtitle}</Text>}
		</View>
	);
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

export default function ProfileScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const logout = useAuthStore((state) => state.logout);

	const { data: xpStats, isLoading: xpLoading } = useQuery({
		queryKey: ["xp-stats", token],
		queryFn: () => fetchXpStats(token!),
		enabled: !!token,
	});

	const { data: heatmapData } = useQuery({
		queryKey: ["heatmap", token],
		queryFn: () => fetchHeatmap(token!),
		enabled: !!token,
	});

	const handleLogout = async () => {
		await logout();
		router.replace("/landing" as Href);
	};

	// Use API data or fallback to user data
	const xp = xpStats?.global.xp ?? user?.xp ?? 0;
	const level = xpStats?.global.level ?? Math.floor(Math.sqrt(xp / 100)) + 1;
	const xpForNextLevel =
		xpStats?.global.xpForNextLevel ?? Math.pow(level, 2) * 100;
	const xpProgress = xpStats?.global.progress ?? 0;
	const streak = xpStats?.streak.current ?? user?.streak ?? 0;
	const multiplier = xpStats?.streak.multiplier ?? 1;

	// Calculate total cards from category progress
	const totalCards =
		xpStats?.byCategory.reduce((sum, c) => sum + c.cardsCompleted, 0) ?? 0;
	const goldCards =
		xpStats?.byCategory.reduce((sum, c) => sum + c.cardsGold, 0) ?? 0;

	const levelColor = getLevelColor(level);

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
							<View
								className="h-20 w-20 rounded-full border-2 items-center justify-center overflow-hidden mr-4"
								style={{ borderColor: levelColor, backgroundColor: "#073B4C" }}
							>
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
								<View className="flex-row items-center gap-2">
									<View
										className="px-3 py-1 rounded-full"
										style={{ backgroundColor: `${levelColor}20` }}
									>
										<Text style={{ color: levelColor }} className="font-semibold text-sm">
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
						{xpLoading ? (
							<ActivityIndicator color="#06D6A0" size="small" />
						) : (
							<View className="mb-2">
								<View className="flex-row justify-between mb-1">
									<Text className="text-text-secondary text-xs">Expérience</Text>
									<Text className="text-text-secondary text-xs">
										{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
									</Text>
								</View>
								<View className="h-2 bg-synap-teal rounded-full overflow-hidden">
									<View
										className="h-full rounded-full"
										style={{
											width: `${Math.min(xpProgress * 100, 100)}%`,
											backgroundColor: levelColor,
										}}
									/>
								</View>
							</View>
						)}
					</View>

					{/* Stats Row */}
					<View className="flex-row gap-3 mb-6">
						<StatCard
							label={t("profile.streak")}
							value={`${streak}j`}
							color="#06D6A0"
							subtitle={multiplier > 1 ? `×${multiplier.toFixed(1)}` : undefined}
						/>
						<StatCard
							label={t("profile.xp")}
							value={xp.toLocaleString()}
							color="#FFD166"
						/>
						<StatCard
							label="Cartes"
							value={totalCards}
							color="#118AB2"
							subtitle={goldCards > 0 ? `${goldCards} ⭐` : undefined}
						/>
					</View>

					{/* Activity Heatmap */}
					<View className="mb-6">
						<ActivityHeatmap data={heatmapData ?? []} />
					</View>

					{/* Category Progress */}
					{xpStats?.byCategory && xpStats.byCategory.length > 0 && (
						<View className="mb-6">
							<Text className="text-white font-semibold mb-3">
								Progression par thème
							</Text>
							<View className="gap-2">
								{xpStats.byCategory.map((cat) => (
									<View
										key={cat.categoryId}
										className="bg-synap-teal-medium rounded-xl p-3 border border-synap-teal-light flex-row items-center"
									>
										<View className="flex-1">
											<Text className="text-white font-medium">{cat.categoryName}</Text>
											<Text className="text-text-tertiary text-xs">
												Niveau {cat.level} • {cat.cardsCompleted} cartes
											</Text>
										</View>
										<View className="items-end">
											<Text className="text-synap-gold font-bold">{cat.xp} XP</Text>
											{cat.cardsGold > 0 && (
												<Text className="text-synap-gold text-xs">⭐ {cat.cardsGold}</Text>
											)}
										</View>
									</View>
								))}
							</View>
						</View>
					)}

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
