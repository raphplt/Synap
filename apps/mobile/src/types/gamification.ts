/**
 * Shared Gamification Types
 */

export interface XpStats {
	global: {
		xp: number;
		level: number;
		xpForNextLevel: number;
		progress: number;
	};
	streak: {
		current: number;
		multiplier: number;
	};
	byCategory: Array<{
		categoryId: string;
		categoryName: string;
		xp: number;
		level: number;
		cardsCompleted: number;
		cardsGold: number;
	}>;
}

export interface HeatmapData {
	date: string;
	count: number;
}

export type XpEventType =
	| "CARD_VIEW"
	| "CARD_RETAINED"
	| "CARD_FORGOT"
	| "CARD_GOLD"
	| "QUIZ_SUCCESS"
	| "DECK_COMPLETE";

export interface XpResult {
	xpAwarded: number;
	newTotal: number;
	levelUp: boolean;
}
