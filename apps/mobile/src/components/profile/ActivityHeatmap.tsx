import { View, Text } from "react-native";
import type { HeatmapData } from "../../types/gamification";

const getActivityColor = (count: number): string => {
	if (count === 0) return "#0A5266";
	if (count === 1) return "#065F46";
	if (count === 2) return "#059669";
	if (count === 3) return "#10B981";
	return "#06D6A0";
};

interface ActivityHeatmapProps {
	data: HeatmapData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
	// Fill in missing days for last 12 weeks
	const filledData: HeatmapData[] = [];
	const today = new Date();
	const dataMap = new Map(data.map((d) => [d.date, d.count]));

	// 12 weeks * 7 days = 84 days. Index 0 to 83.
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
		<View className="bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light shadow-sm">
			<Text className="text-white font-semibold mb-3">
				Activité (12 semaines)
			</Text>
			<View className="flex-row gap-1 justify-between">
				{weeks.map((week, weekIndex) => (
					<View key={weekIndex} className="gap-1 flex-1">
						{week.map((day, dayIndex) => (
							<View
								key={`${weekIndex}-${dayIndex}`}
								className="aspect-square w-full rounded-sm"
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
