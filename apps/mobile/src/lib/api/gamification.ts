/**
 * Gamification API
 */
import { getApiBaseUrl } from "./config";
import type { XpEventType, XpResult, XpStats, HeatmapData } from "../../types/gamification";

export async function awardXp(
	reason: XpEventType,
	cardId?: string,
	token?: string,
	baseUrl = getApiBaseUrl(),
): Promise<XpResult> {
	if (!token) throw new Error("No token provided");

	const response = await fetch(`${baseUrl}/gamification/action`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ reason, cardId }),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function fetchXpStats(token: string): Promise<XpStats> {
	const response = await fetch(`${getApiBaseUrl()}/gamification/stats`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch XP stats");
	return response.json();
}

export async function fetchHeatmap(token: string): Promise<HeatmapData[]> {
	const response = await fetch(`${getApiBaseUrl()}/gamification/heatmap`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Failed to fetch heatmap");
	return response.json();
}
