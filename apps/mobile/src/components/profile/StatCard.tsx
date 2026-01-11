import { View, Text } from "react-native";

interface StatCardProps {
	label: string;
	value: string | number;
	color: string;
	subtitle?: string;
}

export function StatCard({ label, value, color, subtitle }: StatCardProps) {
	return (
		<View className="flex-1 bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light items-center shadow-sm">
			<Text className="text-3xl font-bold" style={{ color }}>
				{value}
			</Text>
			<Text className="text-text-secondary text-sm mt-1 font-medium">
				{label}
			</Text>
			{subtitle && (
				<Text className="text-text-tertiary text-xs mt-1">{subtitle}</Text>
			)}
		</View>
	);
}
