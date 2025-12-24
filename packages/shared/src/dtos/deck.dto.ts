// Deck DTOs

export interface DeckResponseDto {
	id: string
	name: string
	slug: string
	description: string
	imageUrl: string
	categoryId?: string | null
	categoryName?: string | null
	cardCount: number
	masteredCount: number
	goldCount: number
	progressPercent: number
}

export interface CategoryResponseDto {
	id: string
	name: string
	slug: string
	description?: string | null
	deckCount: number
}

export interface DeckDetailDto extends DeckResponseDto {
	cards: DeckCardDto[]
}

export interface DeckCardDto {
	id: string
	title: string
	summary: string
	mediaUrl: string
	status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | "GOLD"
}
