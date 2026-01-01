import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, In } from "typeorm";
import { Card } from "../cards/card.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { WikiIngestService } from "../wiki/wiki.service";

interface FeedCard extends Card {
	interaction?: UserCardInteraction | null
}

@Injectable()
export class FeedService {
	private readonly logger = new Logger(FeedService.name);
	private filling = false;

	constructor (
		@InjectRepository(Card)
		private readonly cardRepository: Repository<Card>,
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>,
		private readonly wikiService: WikiIngestService,
	) {}

	private getBufferMin (): number {
		const value = Number(process.env.SYNAP_FEED_BUFFER_MIN ?? 200);
		return Number.isFinite(value) ? Math.max(0, value) : 200;
	}

	private getFillBatchSize (): number {
		const value = Number(process.env.SYNAP_FEED_FILL_BATCH ?? 50);
		const clamped = Number.isFinite(value) ? value : 50;
		return Math.min(100, Math.max(1, clamped));
	}

	private async ensureBuffer (): Promise<void> {
		if (this.filling) return;

		const min = this.getBufferMin();
		if (min <= 0) return;

		this.filling = true;
		try {
			const count = await this.cardRepository.count();
			if (count >= min) return;

			// Use TOP articles and FEATURED instead of random
			this.logger.log(
				`Buffer Wiki: ${count}/${min} -> ingest top articles + featured`,
			);

			// First ingest featured articles (high quality)
			await this.wikiService.ingestFeatured();

			// Then fill with top pageviews (popular content)
			const toFetch = Math.min(min - count, this.getFillBatchSize());
			await this.wikiService.ingestTopPageviews(toFetch);
		} catch (error) {
			this.logger.warn(`ensureBuffer failed: ${String(error)}`);
		} finally {
			this.filling = false;
		}
	}

	/**
	 * Get personalized feed for authenticated user
	 * Rule: 70% New / 20% Review / 10% Challenge
	 */
	async getPersonalizedFeed (
		userId: string,
		take: number = 10,
	): Promise<FeedCard[]> {
		void this.ensureBuffer();

		// Calculate distribution
		const newCount = Math.ceil(take * 0.7);
		const reviewCount = Math.ceil(take * 0.2);
		const challengeCount = take - newCount - reviewCount;

		// Get cards user has already seen
		const seenInteractions = await this.interactionRepository.find({
			where: { userId },
			select: ["cardId"],
		});
		const seenCardIds = seenInteractions.map((i) => i.cardId);

		// Get cards due for review
		const dueInteractions = await this.interactionRepository.find({
			where: {
				userId,
				status: In(["LEARNING", "REVIEW"]),
			},
			relations: ["card"],
			order: { nextReviewDate: "ASC" },
			take: reviewCount,
		});

		// 1. NEW cards (never seen)
		const newCards = await this.cardRepository.find({
			where: seenCardIds.length > 0 ? { id: Not(In(seenCardIds)) } : {},
			order: { qualityScore: "DESC", createdAt: "DESC" },
			take: newCount,
		});

		// 2. REVIEW cards (due for review)
		const reviewCards = dueInteractions
			.filter((i) => i.card)
			.map((i) => ({ ...i.card!, interaction: i }));

		// 3. CHALLENGE cards (mastered, for reinforcement)
		const masteredInteractions = await this.interactionRepository.find({
			where: {
				userId,
				status: In(["MASTERED", "GOLD"]),
			},
			relations: ["card"],
			order: { lastReviewedAt: "ASC" },
			take: challengeCount,
		});
		const challengeCards = masteredInteractions
			.filter((i) => i.card)
			.map((i) => ({ ...i.card!, interaction: i }));

		// Combine and shuffle
		const feed: FeedCard[] = [...newCards, ...reviewCards, ...challengeCards];

		// Fisher-Yates shuffle
		for (let i = feed.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[feed[i], feed[j]] = [feed[j], feed[i]];
		}

		this.logger.log(
			`Feed for ${userId}: ${newCards.length} new, ${reviewCards.length} review, ${challengeCards.length} challenge`,
		);

		return feed.slice(0, take);
	}

	/**
	 * Get anonymous feed (for non-authenticated users)
	 */
	async getAnonymousFeed (cursor: number, take: number) {
		void this.ensureBuffer();

		// Interleave strategy:
		// 1. Partition by deckId
		// 2. Order by createdAt DESC within deck (newest first)
		// 3. Assign row number (rn)
		// 4. Order global result by rn ASC (pick 1st from all decks, then 2nd, etc.)
		// 5. Secondary sort by deckId hash to mix them up but keep stable for pagination
		const rawResults = await this.cardRepository.query(
			`
			WITH RankedCards AS (
				SELECT "id", "deckId", "createdAt",
					ROW_NUMBER() OVER (PARTITION BY "deckId" ORDER BY "createdAt" DESC) as rn
				FROM cards
			)
			SELECT rc.id
			FROM RankedCards rc
			ORDER BY rc.rn ASC, MD5(rc."deckId"::text) ASC
			OFFSET $1 LIMIT $2
			`,
			[cursor, take],
		);

		const ids = rawResults.map((r: { id: string }) => r.id);

		if (ids.length === 0) {
			return { items: [], nextCursor: null };
		}

		// Fetch full entities
		const cards = await this.cardRepository.find({
			where: { id: In(ids) },
		});

		// Restore order (In() does not guarantee order)
		const orderedCards = ids
			.map((id: string) => cards.find((c) => c.id === id))
			.filter((c: Card | undefined): c is Card => !!c);

		return {
			items: orderedCards,
			nextCursor: rawResults.length === take ? cursor + take : null,
		};
	}
}
