import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Deck } from "./deck.entity"
import { Category } from "./category.entity"

@Injectable()
export class DecksService {
	constructor (
		@InjectRepository(Deck)
		private readonly deckRepository: Repository<Deck>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
	) {}

	async findAllDecks (): Promise<Deck[]> {
		return await this.deckRepository.find({
			where: { isActive: true },
			order: { sortOrder: "ASC" },
			relations: ["category"],
		})
	}

	async findDeckBySlug (slug: string): Promise<Deck | null> {
		return await this.deckRepository.findOne({
			where: { slug, isActive: true },
			relations: ["category", "cards"],
		})
	}

	async findDeckById (id: string): Promise<Deck | null> {
		return await this.deckRepository.findOne({
			where: { id },
			relations: ["category", "cards"],
		})
	}

	async findAllCategories (): Promise<Category[]> {
		return await this.categoryRepository.find({
			order: { sortOrder: "ASC" },
		})
	}

	async findCategoryBySlug (slug: string): Promise<Category | null> {
		return await this.categoryRepository.findOne({
			where: { slug },
		})
	}

	async getDecksByCategory (categoryId: string): Promise<Deck[]> {
		return await this.deckRepository.find({
			where: { categoryId, isActive: true },
			order: { sortOrder: "ASC" },
		})
	}
}
