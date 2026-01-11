import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Card } from "../cards/card.entity";
import type { Deck } from "../decks/deck.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { WikiIngestService } from "../wiki/wiki.service";

interface FeedCard extends Card {
	interaction?: UserCardInteraction | null;
	category?: string | null;
}

type FeedCardCandidate = Card & { deckSlug: string; categorySlug: string };

@Injectable()
export class FeedService {
	private readonly logger = new Logger(FeedService.name);
	private filling = false;

	constructor(
		@InjectRepository(Card)
		private readonly cardRepository: Repository<Card>,
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>,
		private readonly wikiService: WikiIngestService,
	) {}

	private getBufferMin(): number {
		const value = Number(process.env.SYNAP_FEED_BUFFER_MIN ?? 200);
		return Number.isFinite(value) ? Math.max(0, value) : 200;
	}

	private getFillBatchSize(): number {
		const value = Number(process.env.SYNAP_FEED_FILL_BATCH ?? 50);
		const clamped = Number.isFinite(value) ? value : 50;
		return Math.min(100, Math.max(1, clamped));
	}

	private async ensureBuffer(): Promise<void> {
		if (this.filling) return;

		const min = this.getBufferMin();
		if (min <= 0) return;

		this.filling = true;
		try {
			const count = await this.cardRepository.count();
			if (count >= min) return;

			// Use TOP articles and FEATURED instead of random
			this.logger.log(`Buffer Wiki: ${count}/${min} -> ingest top articles + featured`);

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
	 * Rule: 50% New / 35% Review / 15% Challenge
	 * Warm-up: Start with 2-3 MASTERED cards for confidence boost
	 */
	async getPersonalizedFeed(userId: string, take: number = 10): Promise<FeedCard[]> {
		void this.ensureBuffer();

		// Warm-up: 2-3 easy cards at the start
		const warmUpCount = Math.min(3, Math.ceil(take * 0.2));
		const mainCount = take - warmUpCount;

		// Calculate distribution for main feed (50/35/15)
		const newCount = Math.ceil(mainCount * 0.5);
		const reviewCount = Math.ceil(mainCount * 0.35);
		const challengeCount = Math.max(0, mainCount - newCount - reviewCount);

		// Get cards due for review
		const dueInteractions = await this.interactionRepository.find({
			where: {
				userId,
				status: In(["LEARNING", "REVIEW"]),
			},
			relations: ["card", "card.deck", "card.deck.category"],
			order: { nextReviewDate: "ASC" },
			take: reviewCount,
		});

		// 1. Get candidate cards from all decks using LATERAL JOIN
		// We fetch the next 3 available cards per deck to allow for some "streaking" (0, 1, 2)
		// while maintaining diversity.
		const candidates = await this.cardRepository.query(
			`
			SELECT c.*, d.slug as "deckSlug", cat.slug as "categorySlug"
			FROM decks d
			JOIN categories cat ON d."categoryId" = cat.id
			CROSS JOIN LATERAL (
				SELECT c.*
				FROM cards c
				WHERE c."deckId" = d.id
				AND c.id NOT IN (SELECT "cardId" FROM user_card_interactions WHERE "userId" = $1)
				ORDER BY c."sortOrder" ASC
				LIMIT 3
			) c
			WHERE d."isActive" = true
			`,
			[userId],
		);

		// 2. Organize candidates into queues per deck
		const queues: Record<string, FeedCard[]> = {};
		for (const raw of candidates as FeedCardCandidate[]) {
			const card = this.cardRepository.create(raw);
			card.deck = {
				...raw,
				slug: raw.deckSlug,
				category: { slug: raw.categorySlug },
			} as unknown as Deck;

			const dId = card.deckId;
			if (dId) {
				if (!queues[dId]) {
					queues[dId] = [];
				}
				queues[dId].push({
					...card,
					category: raw.categorySlug,
				});
			}
		}

		// 3. Draft from queues randomly until we have enough new cards
		// This ensures we always respect sortOrder (0 before 1) but randomize between decks.
		const newCards: FeedCard[] = [];
		const deckIds = Object.keys(queues);

		while (newCards.length < newCount && deckIds.length > 0) {
			// Pick a random deck
			const randomDeckIndex = Math.floor(Math.random() * deckIds.length);
			const deckId = deckIds[randomDeckIndex];
			const queue = queues[deckId];

			// Dequeue the next card
			const card = queue.shift();
			if (card) {
				newCards.push(card);
			}

			// If queue empty, remove deck from selection
			if (queue.length === 0) {
				deckIds.splice(randomDeckIndex, 1);
			}
		}

		// 2. REVIEW cards (due for review)

		// 2. REVIEW cards (due for review)
		// 2. REVIEW cards (due for review)
		const reviewCards = dueInteractions
			.filter((i) => i.card)
			.map((i) => ({
				...i.card!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
				interaction: i,
				category: i.card?.deck?.category?.slug,
			}));

		// 3. CHALLENGE cards (mastered, for reinforcement)
		const masteredInteractions = await this.interactionRepository.find({
			where: {
				userId,
				status: In(["MASTERED", "GOLD"]),
			},
			relations: ["card", "card.deck", "card.deck.category"],
			order: { consecutiveSuccesses: "DESC", lastReviewedAt: "ASC" },
			take: challengeCount + warmUpCount, // Get extra for warm-up
		});
		const allMasteredCards = masteredInteractions
			.filter((i) => i.card)
			.map((i) => ({
				...i.card!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
				interaction: i,
				category: i.card?.deck?.category?.slug,
			}));

		// Split mastered cards: warm-up (easy ones first) and challenge
		const warmUpCards = allMasteredCards.slice(0, warmUpCount);
		const challengeCards = allMasteredCards.slice(warmUpCount, warmUpCount + challengeCount);

		// Combine main feed and shuffle
		const mainFeed: FeedCard[] = [...newCards, ...reviewCards, ...challengeCards];

		// Fisher-Yates shuffle for main feed only
		for (let i = mainFeed.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[mainFeed[i], mainFeed[j]] = [mainFeed[j], mainFeed[i]];
		}

		// Warm-up cards go first (not shuffled), then shuffled main feed
		const feed: FeedCard[] = [...warmUpCards, ...mainFeed];

		this.logger.log(
			`Feed for ${userId}: ${warmUpCards.length} warm-up, ${newCards.length} new, ${reviewCards.length} review, ${challengeCards.length} challenge`,
		);

		return feed.slice(0, take).map((card) => ({
			...card,
			category: card.deck?.category?.slug ?? card.category,
		}));
	}

	/**
	 * Get anonymous feed (for non-authenticated users)
	 */
	async getAnonymousFeed(cursor: number, take: number) {
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

		const ids = (rawResults as Array<{ id: string }>).map((r) => r.id);

		if (ids.length === 0) {
			return { items: [], nextCursor: null };
		}

		// Fetch full entities
		const cards = await this.cardRepository.find({
			where: { id: In(ids) },
			relations: ["deck", "deck.category"],
		});

		// Restore order (In() does not guarantee order)
		const orderedCards = ids
			.map((id: string) => cards.find((c) => c.id === id))
			.filter((c: Card | undefined): c is Card => !!c)
			.map((card) => ({
				...card,
				category: card.deck?.category?.slug,
			}));

		return {
			items: orderedCards,
			nextCursor: rawResults.length === take ? cursor + take : null,
		};
	}
}
