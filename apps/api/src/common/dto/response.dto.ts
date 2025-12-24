/**
 * Base Response DTO types for API standardization
 * All controllers should return these DTOs instead of raw TypeORM entities
 */

// User Response (excludes passwordHash)
export interface UserResponseDto {
	id: string
	email: string
	username: string
	avatarUrl?: string | null
	xp: number
	streak: number
	interests: string[]
	lastActivityAt?: Date | null
	createdAt: Date
	updatedAt: Date
}

// Card Response
export interface CardResponseDto {
	id: string
	title: string
	summary: string
	content: string
	mediaUrl: string
	sourceLink: string
	sourceAttribution?: string | null
	origin: string
	qualityScore: number
	deckId?: string | null
	createdAt: Date
	updatedAt: Date
}

// Category Response
export interface CategoryResponseDto {
	id: string
	name: string
	slug: string
	description?: string | null
	imageUrl?: string | null
	sortOrder: number
	createdAt: Date
	updatedAt: Date
}

// Deck Response
export interface DeckResponseDto {
	id: string
	name: string
	slug: string
	description: string
	imageUrl: string
	categoryId?: string | null
	category?: CategoryResponseDto | null
	cardCount: number
	sortOrder: number
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

// Paginated Response
export interface PaginatedResponseDto<T> {
	items: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}

// Auth Response
export interface AuthResponseDto {
	accessToken: string
	user: UserResponseDto
}
