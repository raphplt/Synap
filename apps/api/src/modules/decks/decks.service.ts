import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Deck } from "./deck.entity";
import { Category } from "./category.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";

export interface PaginatedResult<T> {
	items: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}

export interface DeckStats {
	id: string
	name: string
	slug: string
	description: string
	imageUrl: string
	categoryId?: string | null
	categoryName?: string | null
	totalCards: number
	masteredCards: number
	goldCards: number
	progressPercent: number
}

@Injectable()
export class DecksService {
	constructor(
		@InjectRepository(Deck)
		private readonly deckRepository: Repository<Deck>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>,
	) {}

	// ============ DECKS ============

	async findAllDecksPaginated(
		page: number = 1,
		limit: number = 20,
		search?: string,
	): Promise<PaginatedResult<Deck>> {
		const safePage = Math.max(1, page);
		const safeLimit = Math.min(100, Math.max(1, limit));
		const skip = (safePage - 1) * safeLimit;

		const queryBuilder = this.deckRepository
			.createQueryBuilder("deck")
			.leftJoinAndSelect("deck.category", "category");

		if (search?.trim()) {
			queryBuilder.where("deck.name ILIKE :search OR deck.description ILIKE :search", {
				search: `%${search.trim()}%`,
			});
		}

		queryBuilder.orderBy("deck.sortOrder", "ASC").skip(skip).take(safeLimit);

		const [items, total] = await queryBuilder.getManyAndCount();

		return {
			items,
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		};
	}

	async findAllDecks(): Promise<Deck[]> {
		return await this.deckRepository.find({
			where: { isActive: true },
			order: { sortOrder: "ASC" },
			relations: ["category"],
		});
	}

	async findDeckBySlug(slug: string): Promise<Deck | null> {
		return await this.deckRepository.findOne({
			where: { slug, isActive: true },
			relations: ["category", "cards"],
		});
	}

	async findDeckById(id: string): Promise<Deck | null> {
		return await this.deckRepository.findOne({
			where: { id },
			relations: ["category", "cards"],
		});
	}

	async createDeck(data: Partial<Deck>): Promise<Deck> {
		const deck = this.deckRepository.create(data);
		return await this.deckRepository.save(deck);
	}

	async updateDeck(id: string, data: Partial<Deck>): Promise<Deck> {
		const deck = await this.findDeckById(id);
		if (!deck) {
			throw new Error(`Deck ${id} not found`);
		}
		Object.assign(deck, data);
		return await this.deckRepository.save(deck);
	}

	async deleteDeck(id: string): Promise<void> {
		const deck = await this.findDeckById(id);
		if (!deck) {
			throw new Error(`Deck ${id} not found`);
		}
		await this.deckRepository.remove(deck);
	}

	async countDecks(): Promise<number> {
		return await this.deckRepository.count();
	}

	// ============ CATEGORIES ============

	async findAllCategoriesPaginated(
		page: number = 1,
		limit: number = 20,
		search?: string,
	): Promise<PaginatedResult<Category>> {
		const safePage = Math.max(1, page);
		const safeLimit = Math.min(100, Math.max(1, limit));
		const skip = (safePage - 1) * safeLimit;

		const queryBuilder = this.categoryRepository.createQueryBuilder("category");

		if (search?.trim()) {
			queryBuilder.where("category.name ILIKE :search OR category.description ILIKE :search", {
				search: `%${search.trim()}%`,
			});
		}

		queryBuilder.orderBy("category.sortOrder", "ASC").skip(skip).take(safeLimit);

		const [items, total] = await queryBuilder.getManyAndCount();

		return {
			items,
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		};
	}

	async findAllCategories(): Promise<Category[]> {
		return await this.categoryRepository.find({
			order: { sortOrder: "ASC" },
		});
	}

	async findCategoryBySlug(slug: string): Promise<Category | null> {
		return await this.categoryRepository.findOne({
			where: { slug },
		});
	}

	async findCategoryById(id: string): Promise<Category | null> {
		return await this.categoryRepository.findOne({
			where: { id },
		});
	}

	async createCategory(data: Partial<Category>): Promise<Category> {
		const category = this.categoryRepository.create(data);
		return await this.categoryRepository.save(category);
	}

	async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
		const category = await this.findCategoryById(id);
		if (!category) {
			throw new Error(`Category ${id} not found`);
		}
		Object.assign(category, data);
		return await this.categoryRepository.save(category);
	}

	async deleteCategory(id: string): Promise<void> {
		const category = await this.findCategoryById(id);
		if (!category) {
			throw new Error(`Category ${id} not found`);
		}
		await this.categoryRepository.remove(category);
	}

	async countCategories(): Promise<number> {
		return await this.categoryRepository.count();
	}

	// ============ OTHER ============

	async getDecksByCategory(categoryId: string): Promise<Deck[]> {
		return await this.deckRepository.find({
			where: { categoryId, isActive: true },
			order: { sortOrder: "ASC" },
		});
	}

	async getAtlasStats(userId: string, categorySlug?: string): Promise<DeckStats[]> {
		const queryBuilder = this.deckRepository
			.createQueryBuilder("deck")
			.leftJoinAndSelect("deck.category", "category")
			.leftJoinAndSelect("deck.cards", "cards")
			.where("deck.isActive = :isActive", { isActive: true })
			.orderBy("deck.sortOrder", "ASC");

		// Filter by category if provided
		if (categorySlug) {
			queryBuilder.andWhere("category.slug = :categorySlug", { categorySlug });
		}

		const decks = await queryBuilder.getMany();

		const stats: DeckStats[] = [];

		for (const deck of decks) {
			const cardIds = deck.cards?.map((c) => c.id) ?? [];
			const totalCards = cardIds.length;

			if (totalCards === 0) {
				stats.push({
					id: deck.id,
					name: deck.name,
					slug: deck.slug,
					description: deck.description,
					imageUrl: deck.imageUrl,
					categoryId: deck.categoryId,
					categoryName: deck.category?.name ?? null,
					totalCards: 0,
					masteredCards: 0,
					goldCards: 0,
					progressPercent: 0,
				});
				continue;
			}

			const interactions = await this.interactionRepository
				.createQueryBuilder("interaction")
				.where("interaction.userId = :userId", { userId })
				.andWhere("interaction.cardId IN (:...cardIds)", { cardIds })
				.getMany();

			const masteredCards = interactions.filter(
				(i) => i.status === "MASTERED" || i.status === "GOLD",
			).length;
			const goldCards = interactions.filter((i) => i.status === "GOLD").length;
			const progressPercent = Math.round((masteredCards / totalCards) * 100);

			stats.push({
				id: deck.id,
				name: deck.name,
				slug: deck.slug,
				description: deck.description,
				imageUrl: deck.imageUrl,
				categoryId: deck.categoryId,
				categoryName: deck.category?.name ?? null,
				totalCards,
				masteredCards,
				goldCards,
				progressPercent,
			});
		}

		return stats;
	}

	/**
	 * Get deck detail with user progress for Atlas deck view
	 */
	async getDeckWithProgress(userId: string, deckId: string): Promise<DeckStats | null> {
		const deck = await this.deckRepository.findOne({
			where: { id: deckId },
			relations: ["category", "cards"],
		});

		if (!deck) {
			return null;
		}

		const cardIds = deck.cards?.map((c) => c.id) ?? [];
		const totalCards = cardIds.length;

		if (totalCards === 0) {
			return {
				id: deck.id,
				name: deck.name,
				slug: deck.slug,
				description: deck.description,
				imageUrl: deck.imageUrl,
				categoryId: deck.categoryId,
				categoryName: deck.category?.name ?? null,
				totalCards: 0,
				masteredCards: 0,
				goldCards: 0,
				progressPercent: 0,
			};
		}

		const interactions = await this.interactionRepository
			.createQueryBuilder("interaction")
			.where("interaction.userId = :userId", { userId })
			.andWhere("interaction.cardId IN (:...cardIds)", { cardIds })
			.getMany();

		const masteredCards = interactions.filter(
			(i) => i.status === "MASTERED" || i.status === "GOLD",
		).length;
		const goldCards = interactions.filter((i) => i.status === "GOLD").length;
		const progressPercent = Math.round((masteredCards / totalCards) * 100);

		return {
			id: deck.id,
			name: deck.name,
			slug: deck.slug,
			description: deck.description,
			imageUrl: deck.imageUrl,
			categoryId: deck.categoryId,
			categoryName: deck.category?.name ?? null,
			totalCards,
			masteredCards,
			goldCards,
			progressPercent,
		};
	}

	/**
	 * Get cards for a deck with user progress status
	 */
	async getDeckCardsWithProgress(
		userId: string,
		deckId: string,
	): Promise<
		Array<{
			id: string
			title: string
			summary: string
			mediaUrl: string
			status: string
			lastReviewedAt: Date | null
			sortOrder: number
		}>
	> {
		const deck = await this.deckRepository.findOne({
			where: { id: deckId },
			relations: ["cards"],
		});

		if (!deck?.cards) {
			return [];
		}

		const cardIds = deck.cards.map((c) => c.id);
		if (cardIds.length === 0) {
			return [];
		}

		const interactions = await this.interactionRepository
			.createQueryBuilder("interaction")
			.where("interaction.userId = :userId", { userId })
			.andWhere("interaction.cardId IN (:...cardIds)", { cardIds })
			.getMany();

		const interactionMap = new Map(interactions.map((i) => [i.cardId, i]));

		// Sort cards by sortOrder
		const sortedCards = [...deck.cards].sort((a, b) => a.sortOrder - b.sortOrder);

		return sortedCards.map((card) => {
			const interaction = interactionMap.get(card.id);
			return {
				id: card.id,
				title: card.title,
				summary: card.summary,
				mediaUrl: card.mediaUrl,
				status: interaction?.status ?? "NEW",
				lastReviewedAt: interaction?.lastReviewedAt ?? null,
				sortOrder: card.sortOrder,
			};
		});
	}
}
