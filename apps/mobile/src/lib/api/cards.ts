/**
 * Cards API (Interactions: Like, Bookmark)
 */
import { getApiBaseUrl } from "./config";

export interface BookmarkStatus {
	liked: boolean;
	bookmarked: boolean;
}

export async function likeCard(
	cardId: string,
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<{ active: boolean }> {
	const response = await fetch(`${baseUrl}/cards/${cardId}/like`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function bookmarkCard(
	cardId: string,
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<{ active: boolean }> {
	const response = await fetch(`${baseUrl}/cards/${cardId}/bookmark`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function getCardBookmarkStatus(
	cardId: string,
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<BookmarkStatus> {
	const response = await fetch(`${baseUrl}/cards/${cardId}/bookmark-status`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}
