/**
 * Decks & Categories API
 */
import { getApiBaseUrl } from "./config";

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	sortOrder: number;
}

export interface Deck {
	id: string;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	categoryId?: string | null;
	isActive: boolean;
}

export async function getDecks(baseUrl = getApiBaseUrl()): Promise<Deck[]> {
	const response = await fetch(`${baseUrl}/decks`);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function getDeckBySlug(
	slug: string,
	baseUrl = getApiBaseUrl()
): Promise<Deck | null> {
	const response = await fetch(`${baseUrl}/decks/${slug}`);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
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
