/**
 * Mapper utilities for Entity -> DTO transformations
 * Ensures sensitive fields are never exposed and response format is consistent
 */

import { User } from "../../modules/users/user.entity"
import { Card } from "../../modules/cards/card.entity"
import { Deck } from "../../modules/decks/deck.entity"
import { Category } from "../../modules/decks/category.entity"
import {
	UserResponseDto,
	CardResponseDto,
	DeckResponseDto,
	CategoryResponseDto,
} from "../dto/response.dto"

export class ResponseMapper {
	/**
	 * Map User entity to UserResponseDto (excludes passwordHash)
	 */
	static toUserDto(user: User): UserResponseDto {
		return {
			id: user.id,
			email: user.email,
			username: user.username,
			avatarUrl: user.avatarUrl,
			xp: user.xp,
			streak: user.streak,
			interests: user.interests,
			lastActivityAt: user.lastActivityAt,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}
	}

	/**
	 * Map Card entity to CardResponseDto
	 */
	static toCardDto(card: Card): CardResponseDto {
		return {
			id: card.id,
			title: card.title,
			summary: card.summary,
			content: card.content,
			mediaUrl: card.mediaUrl,
			sourceLink: card.sourceLink,
			sourceAttribution: card.sourceAttribution,
			origin: card.origin,
			qualityScore: card.qualityScore,
			deckId: card.deckId,
			createdAt: card.createdAt,
			updatedAt: card.updatedAt,
		}
	}

	/**
	 * Map Category entity to CategoryResponseDto
	 */
	static toCategoryDto(category: Category): CategoryResponseDto {
		return {
			id: category.id,
			name: category.name,
			slug: category.slug,
			description: category.description,
			imageUrl: category.imageUrl,
			sortOrder: category.sortOrder,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		}
	}

	/**
	 * Map Deck entity to DeckResponseDto
	 */
	static toDeckDto(deck: Deck): DeckResponseDto {
		return {
			id: deck.id,
			name: deck.name,
			slug: deck.slug,
			description: deck.description,
			imageUrl: deck.imageUrl,
			categoryId: deck.categoryId,
			category: deck.category ? this.toCategoryDto(deck.category) : null,
			cardCount: deck.cardCount,
			sortOrder: deck.sortOrder,
			isActive: deck.isActive,
			createdAt: deck.createdAt,
			updatedAt: deck.updatedAt,
		}
	}

	/**
	 * Map array of entities
	 */
	static toUserDtoList(users: User[]): UserResponseDto[] {
		return users.map((u) => this.toUserDto(u))
	}

	static toCardDtoList(cards: Card[]): CardResponseDto[] {
		return cards.map((c) => this.toCardDto(c))
	}

	static toDeckDtoList(decks: Deck[]): DeckResponseDto[] {
		return decks.map((d) => this.toDeckDto(d))
	}

	static toCategoryDtoList(categories: Category[]): CategoryResponseDto[] {
		return categories.map((c) => this.toCategoryDto(c))
	}
}
