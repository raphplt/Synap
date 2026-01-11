import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { fetchHeatmap, fetchXpStats } from "../lib/api/gamification";

export function useXpStats() {
	const token = useAuthStore((state) => state.token);

	return useQuery({
		queryKey: ["xp-stats", token],
		queryFn: () => fetchXpStats(token!),
		enabled: !!token,
	});
}

export function useHeatmap() {
	const token = useAuthStore((state) => state.token);

	return useQuery({
		queryKey: ["heatmap", token],
		queryFn: () => fetchHeatmap(token!),
		enabled: !!token,
	});
}
