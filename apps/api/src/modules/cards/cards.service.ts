import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type CreateCardInput, type FeedResponseDto } from "@memex/shared";
import { Repository } from "typeorm";
import { Card } from "./card.entity";

@Injectable()
export class CardsService {
	constructor(
		@InjectRepository(Card)
		private readonly cardsRepository: Repository<Card>
	) {}

	async findBySource(
		sourceType: string,
		sourceId: string
	): Promise<Card | null> {
		return await this.cardsRepository.findOne({
			where: { sourceType, sourceId },
		});
	}

	async countCards(): Promise<number> {
		return await this.cardsRepository.count();
	}

	async upsertCard(payload: CreateCardInput): Promise<Card> {
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

	async rateCard(id: string, rating: number): Promise<Card> {
		const card = await this.cardsRepository.findOneBy({ id });
		if (card == null) {
			throw new Error(`Card ${id} not found`);
		}
		card.userRating = rating;
		return await this.cardsRepository.save(card);
	}

	async getFeed(cursor = 0, take = 10): Promise<FeedResponseDto> {
		const safeTake = Math.min(100, Math.max(1, take));
		const safeCursor = Math.max(0, cursor);

		// Sorting by userRating DESC first (so rated items appear top/bottom),
		// then popularityScore DESC (most popular),
		// then DATE DESC
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
