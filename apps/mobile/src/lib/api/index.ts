/**
 * API Module Barrel Export
 * Re-exports all API functions for backward compatibility
 */

// Config
export { getApiBaseUrl, handleApiError } from "./config";

// Auth
export { signup, login, getMe, oauthLogin } from "./auth";

// Feed
export { fetchFeed, ingestRandomWiki } from "./feed";

// SRS
export { reviewCard, getCardsDue, getProgress } from "./srs";
export type { SrsRating } from "./srs";

// Gamification
export { awardXp } from "./gamification";
export type { XpEventType, XpResult } from "./gamification";

// Decks & Categories
export { getDecks, getDeckBySlug, getCategories } from "./decks";
export type { Category, Deck } from "./decks";

// Cards
export { likeCard, bookmarkCard, getCardBookmarkStatus } from "./cards";
export type { BookmarkStatus } from "./cards";

// Users
export { updateUserInterests } from "./users";
