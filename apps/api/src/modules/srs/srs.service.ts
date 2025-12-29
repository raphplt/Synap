import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual } from "typeorm";
import { UserCardInteraction, type CardStatus } from "./user-card-interaction.entity";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

// SM-2 Algorithm implementation
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

@Injectable()
export class SrsService {
	constructor (
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>,
	) {}

	/**
	 * Process a review for a card and update the SRS data
	 */
	async processReview (
		userId: string,
		cardId: string,
		rating: SrsRating,
	): Promise<UserCardInteraction> {
		// Get or create interaction
		let interaction = await this.interactionRepository.findOne({
			where: { userId, cardId },
		});

		if (!interaction) {
			interaction = this.interactionRepository.create({
				userId,
				cardId,
				status: "NEW",
				easeFactor: 2.5,
				interval: 0,
				repetitions: 0,
				consecutiveSuccesses: 0,
			});
		}

		// Convert rating to quality (0-5 for SM-2)
		const quality = this.ratingToQuality(rating);

		// Apply SM-2 algorithm
		interaction = this.applySm2(interaction, quality);

		// Update status based on progression
		interaction.status = this.calculateStatus(interaction);

		// Set last reviewed
		interaction.lastReviewedAt = new Date();

		// Calculate next review date
		interaction.nextReviewDate = this.calculateNextReviewDate(interaction.interval);

		return await this.interactionRepository.save(interaction);
	}

	/**
	 * Get cards due for review for a user
	 */
	async getCardsDueForReview (userId: string, limit: number = 20): Promise<UserCardInteraction[]> {
		const now = new Date();

		return await this.interactionRepository.find({
			where: {
				userId,
				nextReviewDate: LessThanOrEqual(now),
				status: "REVIEW" as CardStatus,
			},
			relations: ["card"],
			order: { nextReviewDate: "ASC" },
			take: limit,
		});
	}

	/**
	 * Get learning cards (cards in the learning phase)
	 */
	async getLearningCards (userId: string, limit: number = 10): Promise<UserCardInteraction[]> {
		return await this.interactionRepository.find({
			where: {
				userId,
				status: "LEARNING" as CardStatus,
			},
			relations: ["card"],
			order: { nextReviewDate: "ASC" },
			take: limit,
		});
	}

	/**
	 * Get user progress statistics
	 */
	async getUserProgress (userId: string): Promise<{
		totalCards: number
		newCards: number
		learningCards: number
		reviewCards: number
		masteredCards: number
		goldCards: number
	}> {
		const interactions = await this.interactionRepository.find({
			where: { userId },
			select: ["status"],
		});

		const stats = {
			totalCards: interactions.length,
			newCards: 0,
			learningCards: 0,
			reviewCards: 0,
			masteredCards: 0,
			goldCards: 0,
		};

		for (const interaction of interactions) {
			switch (interaction.status) {
				case "NEW":
					stats.newCards++;
					break;
				case "LEARNING":
					stats.learningCards++;
					break;
				case "REVIEW":
					stats.reviewCards++;
					break;
				case "MASTERED":
					stats.masteredCards++;
					break;
				case "GOLD":
					stats.goldCards++;
					break;
			}
		}

		return stats;
	}

	/**
	 * Create initial interaction when user first sees a card
	 */
	async createInteraction (userId: string, cardId: string): Promise<UserCardInteraction> {
		const existing = await this.interactionRepository.findOne({
			where: { userId, cardId },
		});

		if (existing) {
			return existing;
		}

		const interaction = this.interactionRepository.create({
			userId,
			cardId,
			status: "NEW",
			easeFactor: 2.5,
			interval: 0,
			repetitions: 0,
			consecutiveSuccesses: 0,
		});

		return await this.interactionRepository.save(interaction);
	}

	// Private helper methods

	private ratingToQuality (rating: SrsRating): number {
		switch (rating) {
			case "AGAIN":
				return 0; // Complete failure
			case "HARD":
				return 2; // Correct with difficulty
			case "GOOD":
				return 4; // Correct with some hesitation
			case "EASY":
				return 5; // Perfect recall
			default:
				return 3;
		}
	}

	private applySm2 (interaction: UserCardInteraction, quality: number): UserCardInteraction {
		// If answer was incorrect (quality < 3), reset
		if (quality < 3) {
			interaction.repetitions = 0;
			interaction.interval = 0;
			interaction.consecutiveSuccesses = 0;
		} else {
			// Correct answer
			interaction.consecutiveSuccesses++;

			if (interaction.repetitions === 0) {
				interaction.interval = 1;
			} else if (interaction.repetitions === 1) {
				interaction.interval = 6;
			} else {
				interaction.interval = Math.round(interaction.interval * Number(interaction.easeFactor));
			}

			interaction.repetitions++;
		}

		// Update ease factor (EF)
		// EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
		const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
		interaction.easeFactor = Math.max(1.3, Number(interaction.easeFactor) + efChange);

		return interaction;
	}

	private calculateStatus (interaction: UserCardInteraction): CardStatus {
		// Gold: 5 consecutive successes after mastered
		if (interaction.consecutiveSuccesses >= 5 && interaction.interval >= 21) {
			return "GOLD";
		}

		// Mastered: graduated from learning, stable reviews
		if (interaction.interval >= 21) {
			return "MASTERED";
		}

		// Review: has been reviewed at least once with success
		if (interaction.repetitions >= 2) {
			return "REVIEW";
		}

		// Learning: started but not graduated
		if (interaction.repetitions >= 1 || interaction.lastReviewedAt) {
			return "LEARNING";
		}

		return "NEW";
	}

	private calculateNextReviewDate (intervalDays: number): Date {
		const date = new Date();
		date.setDate(date.getDate() + intervalDays);
		return date;
	}
}
