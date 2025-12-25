import {
	FeedResponseDto,
	LoginResponseDto,
	UserResponseDto,
} from "@synap/shared";
import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeBaseUrl(raw: string): string {
	const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
	return trimmed.replace(/\/+$/, "");
}

function guessLanHost(): string | null {
	const hostUri =
		(Constants.expoConfig as any)?.hostUri ??
		(Constants as any)?.expoGoConfig?.debuggerHost ??
		(Constants as any)?.manifest?.debuggerHost ??
		(Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

	if (typeof hostUri !== "string" || hostUri.length === 0) return null;

	const host = hostUri.split(":")[0];
	return host.length > 0 ? host : null;
}

export function getApiBaseUrl(): string {
	if (
		process.env.EXPO_PUBLIC_API_URL != null &&
		process.env.EXPO_PUBLIC_API_URL.length > 0
	) {
		return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
	}

	const host = guessLanHost();
	if (host != null) {
		return `http://${host}:3000`;
	}

	return normalizeBaseUrl(
		Platform.select({
			ios: "http://localhost:3000",
			android: "http://10.0.2.2:3000",
			default: "http://localhost:3000",
		}) as string
	);
}

// Feed API
export async function fetchFeed(
	cursor = 0,
	baseUrl = getApiBaseUrl()
): Promise<FeedResponseDto> {
	const response = await fetch(`${baseUrl}/feed?cursor=${cursor}&take=50`);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`API error (${response.status}): ${message}`);
	}

	return (await response.json()) as FeedResponseDto;
}

export async function ingestRandomWiki(
	count = 20,
	baseUrl = getApiBaseUrl()
): Promise<void> {
	const response = await fetch(`${baseUrl}/wiki/ingest/random`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ count }),
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`API error (${response.status}): ${message}`);
	}
}

// Auth API
export async function signup(
	data: {
		email: string;
		username: string;
		password: string;
		interests?: string[];
	},
	baseUrl = getApiBaseUrl()
): Promise<LoginResponseDto> {
	const response = await fetch(`${baseUrl}/auth/signup`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: "Unknown error" }));
		throw new Error(error.message ?? `HTTP ${response.status}`);
	}

	return response.json();
}

export async function login(
	email: string,
	password: string,
	baseUrl = getApiBaseUrl()
): Promise<LoginResponseDto> {
	const response = await fetch(`${baseUrl}/auth/login`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: "Unknown error" }));
		throw new Error(error.message ?? `HTTP ${response.status}`);
	}

	return response.json();
}

export async function getMe(
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<UserResponseDto> {
	const response = await fetch(`${baseUrl}/auth/me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

// SRS API
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

// Gamification API
export type XpEventType =
	| "CARD_VIEW"
	| "CARD_RETAINED"
	| "CARD_FORGOT"
	| "CARD_GOLD"
	| "QUIZ_SUCCESS"
	| "DECK_COMPLETE";

export async function awardXp(
	reason: XpEventType,
	cardId?: string,
	token?: string,
	baseUrl = getApiBaseUrl()
): Promise<{ xpAwarded: number; newTotal: number; levelUp: boolean }> {
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

// Decks API
export async function getDecks(baseUrl = getApiBaseUrl()): Promise<unknown[]> {
	const response = await fetch(`${baseUrl}/decks`);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function getDeckBySlug(
	slug: string,
	baseUrl = getApiBaseUrl()
): Promise<unknown> {
	const response = await fetch(`${baseUrl}/decks/${slug}`);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

// Categories API
export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	sortOrder: number;
}

export async function getCategories(
	baseUrl = getApiBaseUrl()
): Promise<Category[]> {
	const response = await fetch(`${baseUrl}/decks/categories`);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

// User API
export async function updateUserInterests(
	userId: string,
	interests: string[],
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<UserResponseDto> {
	const response = await fetch(`${baseUrl}/users/${userId}`, {
		method: "PATCH",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ interests }),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: "Unknown error" }));
		throw new Error(error.message ?? `HTTP ${response.status}`);
	}

	return response.json();
}
