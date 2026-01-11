import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserCardBookmark, type BookmarkType } from "./user-card-bookmark.entity";

@Injectable()
export class BookmarksService {
	constructor(
		@InjectRepository(UserCardBookmark)
		private readonly bookmarkRepository: Repository<UserCardBookmark>,
	) {}

	/**
	 * Toggle a like or bookmark on a card
	 * Returns the new state (true = active, false = removed)
	 */
	async toggle(userId: string, cardId: string, type: BookmarkType): Promise<{ active: boolean }> {
		const existing = await this.bookmarkRepository.findOne({
			where: { userId, cardId, type },
		});

		if (existing) {
			await this.bookmarkRepository.remove(existing);
			return { active: false };
		}

		const bookmark = this.bookmarkRepository.create({
			userId,
			cardId,
			type,
		});
		await this.bookmarkRepository.save(bookmark);
		return { active: true };
	}

	/**
	 * Check if user has liked/bookmarked a card
	 */
	async getStatus(
		userId: string,
		cardId: string,
	): Promise<{ liked: boolean, bookmarked: boolean }> {
		const bookmarks = await this.bookmarkRepository.find({
			where: { userId, cardId },
		});

		return {
			liked: bookmarks.some((b) => b.type === "LIKE"),
			bookmarked: bookmarks.some((b) => b.type === "BOOKMARK"),
		};
	}

	/**
	 * Get all bookmarks for a user (with cards)
	 */
	async getUserBookmarks(userId: string, type?: BookmarkType): Promise<UserCardBookmark[]> {
		const where: { userId: string, type?: BookmarkType } = { userId };
		if (type) {
			where.type = type;
		}

		return await this.bookmarkRepository.find({
			where,
			relations: ["card"],
			order: { createdAt: "DESC" },
		});
	}

	/**
	 * Get bookmark count for a card
	 */
	async getCardCounts(cardId: string): Promise<{ likes: number, bookmarks: number }> {
		const likes = await this.bookmarkRepository.count({
			where: { cardId, type: "LIKE" },
		});
		const bookmarks = await this.bookmarkRepository.count({
			where: { cardId, type: "BOOKMARK" },
		});

		return { likes, bookmarks };
	}
}
