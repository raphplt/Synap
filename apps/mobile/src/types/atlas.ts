
export interface AtlasCategory {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	sortOrder: number;
}

export interface AtlasDeckStats {
	id: string;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	categoryName?: string | null;
	totalCards: number;
	masteredCards: number;
	goldCards: number;
	progressPercent: number;
}

export type AtlasCardStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | "GOLD";

export interface AtlasDeckCard {
	id: string;
	title: string;
	summary: string;
	mediaUrl: string;
	status: AtlasCardStatus;
	lastReviewedAt: string | null;
	sortOrder: number; // Added for ordering
    isLocked?: boolean; // Frontend computed or backend provided
}

export interface AtlasSection {
    title: string;
    categories: AtlasCategory[];
    type: "interests" | "explore";
}
