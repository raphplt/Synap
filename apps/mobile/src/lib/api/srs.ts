/**
 * SRS (Spaced Repetition System) API
 */
import { getApiBaseUrl } from "./config";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export async function reviewCard(
	cardId: string,
	rating: SrsRating,
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<unknown> {
	const response = await fetch(`${baseUrl}/srs/review`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ cardId, rating }),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function getCardsDue(
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<unknown[]> {
	const response = await fetch(`${baseUrl}/srs/due`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function getProgress(
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<unknown> {
	const response = await fetch(`${baseUrl}/srs/progress`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}
