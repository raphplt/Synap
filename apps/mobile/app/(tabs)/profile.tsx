import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useXpStats, useHeatmap } from "../../src/hooks/useGamification";
import { ProfileHeader } from "../../src/components/profile/ProfileHeader";
import { StatCard } from "../../src/components/profile/StatCard";
import { ActivityHeatmap } from "../../src/components/profile/ActivityHeatmap";

export default function ProfileScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const { data: xpStats, isLoading: xpLoading } = useXpStats();
	const { data: heatmapData } = useHeatmap();

	const handleLogout = async () => {
		await logout();
		router.replace("/landing" as Href);
	};

	const xp = xpStats?.global.xp ?? user?.xp ?? 0;
	const level = xpStats?.global.level ?? Math.floor(Math.sqrt(xp / 100)) + 1;
	const xpForNextLevel = xpStats?.global.xpForNextLevel ?? Math.pow(level, 2) * 100;
	const xpProgress = xpStats?.global.progress ?? 0;
	const streak = xpStats?.streak.current ?? user?.streak ?? 0;
	const multiplier = xpStats?.streak.multiplier ?? 1;

	const totalCards = xpStats?.byCategory.reduce((sum, c) => sum + c.cardsCompleted, 0) ?? 0;
	const goldCards = xpStats?.byCategory.reduce((sum, c) => sum + c.cardsGold, 0) ?? 0;

	const headerStats = {
		xp,
		level,
		xpForNextLevel,
		progress: xpProgress,
	};

	return (
		<View className="flex-1 bg-synap-teal">
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView className="flex-1 mb-20 px-4" showsVerticalScrollIndicator={false}>
					{/* Header */}
					<Text className="text-white text-2xl font-bold mb-6 mt-2">{t("profile.title")}</Text>

					{/* Profile Header */}
					<ProfileHeader user={user} xpStats={headerStats} isLoading={xpLoading} />

					{/* Stats Row */}
					<View className="flex-row gap-3 mb-6">
						<StatCard
							label={t("profile.streak")}
							value={`${streak}j`}
							color="#06D6A0"
							subtitle={multiplier > 1 ? `×${multiplier.toFixed(1)}` : undefined}
						/>
						<StatCard label={t("profile.xp")} value={xp.toLocaleString()} color="#FFD166" />
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
							<Text className="text-white font-semibold mb-3">Progression par thème</Text>
							<View className="gap-2">
								{xpStats.byCategory.map((cat) => (
									<View
										key={cat.categoryId}
										className="bg-synap-teal-medium rounded-xl p-3 border border-synap-teal-light flex-row items-center shadow-sm"
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
							<Text className="text-white font-semibold mb-3">Centres d&apos;intérêt</Text>
							<View className="flex-row flex-wrap gap-2">
								{user.interests.map((interest) => (
									<View
										key={interest}
										className="bg-synap-teal-light px-4 py-2 rounded-full border border-synap-teal-light/50"
									>
										<Text className="text-text-secondary text-sm font-medium">{interest}</Text>
									</View>
								))}
							</View>
						</View>
					)}

					{/* Settings Link */}
					<Pressable className="bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light flex-row items-center justify-between mb-4 shadow-sm active:bg-synap-teal-light/50 transition-colors">
						<Text className="text-white font-medium">{t("settings.title")}</Text>
						<Text className="text-text-secondary">→</Text>
					</Pressable>

					{/* Logout Button */}
					<Pressable
						className="bg-synap-pink py-4 rounded-xl shadow-lg border-b-4 border-synap-pink-dark mb-8 active:border-b-0 active:translate-y-1 transition-all active:bg-synap-pink-light"
						onPress={handleLogout}
					>
						<Text className="text-white text-lg font-bold text-center tracking-wide">
							{t("auth.logout")}
						</Text>
					</Pressable>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}
