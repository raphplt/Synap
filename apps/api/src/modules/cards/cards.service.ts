import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type CreateCardInput, type FeedResponseDto } from "@synap/shared";
import { Repository } from "typeorm";
import { Card } from "./card.entity";

export interface PaginatedResult<T> {
	items: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}

@Injectable()
export class CardsService {
	constructor (
		@InjectRepository(Card)
		private readonly cardsRepository: Repository<Card>,
	) {}

	async findAllPaginated (
		page: number = 1,
		limit: number = 20,
		search?: string,
	): Promise<PaginatedResult<Card>> {
		const safePage = Math.max(1, page);
		const safeLimit = Math.min(100, Math.max(1, limit));
		const skip = (safePage - 1) * safeLimit;

		const queryBuilder = this.cardsRepository.createQueryBuilder("card");

		if (search?.trim()) {
			queryBuilder.where(
				"card.title ILIKE :search OR card.summary ILIKE :search",
				{ search: `%${search.trim()}%` },
			);
		}

		queryBuilder.orderBy("card.createdAt", "DESC").skip(skip).take(safeLimit);

		const [items, total] = await queryBuilder.getManyAndCount();

		return {
			items,
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		};
	}

	async findById (id: string): Promise<Card | null> {
		return await this.cardsRepository.findOne({ where: { id } });
	}

	async findBySource (
		sourceType: string,
		sourceId: string,
	): Promise<Card | null> {
		return await this.cardsRepository.findOne({
			where: { sourceType, sourceId },
		});
	}

	async countCards (): Promise<number> {
		return await this.cardsRepository.count();
	}

	async upsertCard (payload: CreateCardInput): Promise<Card> {
		const hasSourceKey =
			payload.sourceType != null &&
			payload.sourceType.length > 0 &&
			payload.sourceId != null &&
			payload.sourceId.length > 0;

		const existing = hasSourceKey
			? await this.cardsRepository.findOne({
				where: {
					sourceType: payload.sourceType!,
					sourceId: payload.sourceId!,
				},
			  })
			: await this.cardsRepository.findOne({
				where: { sourceLink: payload.sourceLink },
			  });

		if (existing != null) {
			const merged = this.cardsRepository.merge(existing, payload);
			return await this.cardsRepository.save(merged);
		}

		const created = this.cardsRepository.create(payload);
		return await this.cardsRepository.save(created);
	}

	async create (data: Partial<Card>): Promise<Card> {
		const card = this.cardsRepository.create(data);
		return await this.cardsRepository.save(card);
	}

	async update (id: string, data: Partial<Card>): Promise<Card> {
		const card = await this.findById(id);
		if (!card) {
			throw new Error(`Card ${id} not found`);
		}
		Object.assign(card, data);
		return await this.cardsRepository.save(card);
	}

	async delete (id: string): Promise<void> {
		const card = await this.findById(id);
		if (!card) {
			throw new Error(`Card ${id} not found`);
		}
		await this.cardsRepository.remove(card);
	}

	async rateCard (id: string, rating: number): Promise<Card> {
		const card = await this.cardsRepository.findOneBy({ id });
		if (card == null) {
			throw new Error(`Card ${id} not found`);
		}
		card.userRating = rating;
		return await this.cardsRepository.save(card);
	}

	async getFeed (cursor = 0, take = 10): Promise<FeedResponseDto> {
		const safeTake = Math.min(100, Math.max(1, take));
		const safeCursor = Math.max(0, cursor);

		const items = await this.cardsRepository
			.createQueryBuilder("card")
			.orderBy("card.userRating", "DESC")
			.addOrderBy("card.popularityScore", "DESC")
			.addOrderBy("card.createdAt", "DESC")
			.addOrderBy("card.id", "DESC")
			.skip(safeCursor)
			.take(safeTake)
			.getMany();

		const nextCursor =
			items.length === safeTake ? safeCursor + items.length : null;

		return { items, nextCursor };
	}
}
