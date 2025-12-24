import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Deck } from "./deck.entity"
import { Category } from "./category.entity"
import { UserCardInteraction } from "../srs/user-card-interaction.entity";

export interface DeckStats {
	id: string;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	categoryId?: string | null;
	categoryName?: string | null;
	totalCards: number;
	masteredCards: number;
	goldCards: number;
	progressPercent: number;
}

@Injectable()
export class DecksService {
	constructor(
		@InjectRepository(Deck)
		private readonly deckRepository: Repository<Deck>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>
	) {}

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

	async getDecksByCategory(categoryId: string): Promise<Deck[]> {
		return await this.deckRepository.find({
			where: { categoryId, isActive: true },
			order: { sortOrder: "ASC" },
		});
	}

	/**
	 * Get Atlas stats for all decks (with user progress)
	 */
	async getAtlasStats(userId: string): Promise<DeckStats[]> {
		const decks = await this.deckRepository.find({
			where: { isActive: true },
			relations: ["category", "cards"],
			order: { sortOrder: "ASC" },
		});

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

			// Get user interactions for this deck's cards
			const interactions = await this.interactionRepository
				.createQueryBuilder("interaction")
				.where("interaction.userId = :userId", { userId })
				.andWhere("interaction.cardId IN (:...cardIds)", { cardIds })
				.getMany();

			const masteredCards = interactions.filter(
				(i) => i.status === "MASTERED" || i.status === "GOLD"
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
}
