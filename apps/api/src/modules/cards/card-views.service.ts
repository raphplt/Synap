import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserCardView } from "./user-card-view.entity"

@Injectable()
export class CardViewsService {
	constructor(
		@InjectRepository(UserCardView)
		private readonly viewsRepository: Repository<UserCardView>
	) {}

	/**
	 * Mark a card as seen by a user
	 * If already seen, increment viewCount
	 */
	async markAsSeen(userId: string, cardId: string): Promise<UserCardView> {
		const existing = await this.viewsRepository.findOne({
			where: { userId, cardId },
		})

		if (existing) {
			existing.viewCount += 1
			return this.viewsRepository.save(existing)
		}

		const view = this.viewsRepository.create({
			userId,
			cardId,
			viewCount: 1,
		})
		return this.viewsRepository.save(view)
	}

	/**
	 * Check if a user has seen a specific card
	 */
	async hasSeenCard(userId: string, cardId: string): Promise<boolean> {
		const count = await this.viewsRepository.count({
			where: { userId, cardId },
		})
		return count > 0
	}

	/**
	 * Get all card IDs that a user has seen
	 */
	async getSeenCardIds(userId: string): Promise<string[]> {
		const views = await this.viewsRepository.find({
			where: { userId },
			select: ["cardId"],
		})
		return views.map((v) => v.cardId)
	}

	/**
	 * Get count of cards seen by a user
	 */
	async getSeenCount(userId: string): Promise<number> {
		return this.viewsRepository.count({ where: { userId } })
	}

	/**
	 * Get view stats for a specific card
	 */
	async getCardViewStats(
		cardId: string
	): Promise<{ totalViews: number; uniqueViewers: number }> {
		const views = await this.viewsRepository.find({
			where: { cardId },
			select: ["viewCount"],
		})

		const uniqueViewers = views.length
		const totalViews = views.reduce((sum, v) => sum + v.viewCount, 0)

		return { totalViews, uniqueViewers }
	}

	/**
	 * Mark multiple cards as seen at once
	 */
	async markMultipleAsSeen(userId: string, cardIds: string[]): Promise<void> {
		for (const cardId of cardIds) {
			await this.markAsSeen(userId, cardId)
		}
	}
}
