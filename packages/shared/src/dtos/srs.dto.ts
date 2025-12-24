// SRS DTOs

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY"

export type CardStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | "GOLD"

export interface ReviewCardDto {
	cardId: string
	rating: SrsRating
}

export interface UserCardInteractionDto {
	id: string
	cardId: string
	status: CardStatus
	easeFactor: number
	interval: number
	nextReviewDate: string
	consecutiveSuccesses: number
	lastReviewedAt?: string | null
}

export interface UserProgressDto {
	totalCards: number
	newCards: number
	learningCards: number
	reviewCards: number
	masteredCards: number
	goldCards: number
	streakDays: number
	totalXp: number
}
