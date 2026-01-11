import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, DataSource } from "typeorm";
import { Card } from "../cards/card.entity";
import { Deck } from "../decks/deck.entity";
import { Category } from "../decks/category.entity";
import { User } from "../users/user.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { XpEvent } from "../gamification/xp-event.entity";
import { UserCategoryProgress } from "../gamification/user-category-progress.entity";

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(Card)
		private readonly cardRepository: Repository<Card>,
		@InjectRepository(Deck)
		private readonly deckRepository: Repository<Deck>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserCardInteraction)
		private readonly interactionRepository: Repository<UserCardInteraction>,
		@InjectRepository(XpEvent)
		private readonly xpEventRepository: Repository<XpEvent>,
		@InjectRepository(UserCategoryProgress)
		private readonly categoryProgressRepository: Repository<UserCategoryProgress>,
		private readonly dataSource: DataSource,
	) {}

	/**
	 * Get dashboard statistics
	 */
	async getStats(): Promise<{
		totalUsers: number
		totalCards: number
		totalDecks: number
		totalCategories: number
	}> {
		const [totalUsers, totalCards, totalDecks, totalCategories] = await Promise.all([
			this.userRepository.count(),
			this.cardRepository.count(),
			this.deckRepository.count(),
			this.categoryRepository.count(),
		]);

		return {
			totalUsers,
			totalCards,
			totalDecks,
			totalCategories,
		};
	}

	/**
	 * Delete all cards from the database
	 */
	async clearAllCards(): Promise<{ deleted: number }> {
		// First delete all interactions (foreign key constraint)
		await this.interactionRepository.delete({});

		// Then delete all cards
		const result = await this.cardRepository.delete({});

		return { deleted: result.affected ?? 0 };
	}

	/**
	 * Reset the entire database, keeping admin users
	 */
	async resetDatabase(adminEmail: string): Promise<{
		cardsDeleted: number
		decksDeleted: number
		categoriesDeleted: number
		usersDeleted: number
		interactionsDeleted: number
		xpEventsDeleted: number
	}> {
		// Get the admin user to preserve
		const adminUser = await this.userRepository.findOne({
			where: { email: adminEmail },
		});

		if (!adminUser) {
			throw new ForbiddenException("Admin user not found");
		}

		// Use a transaction for atomic operations
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// 1. Delete XP events (except admin's)
			const xpResult = await queryRunner.manager.delete(XpEvent, {
				userId: Not(adminUser.id),
			});

			// 2. Delete category progress (except admin's)
			await queryRunner.manager.delete(UserCategoryProgress, {
				userId: Not(adminUser.id),
			});

			// 3. Delete all card interactions
			const interactionResult = await queryRunner.manager.delete(UserCardInteraction, {});

			// 4. Delete all cards
			const cardResult = await queryRunner.manager.delete(Card, {});

			// 5. Delete all decks
			const deckResult = await queryRunner.manager.delete(Deck, {});

			// 6. Delete all categories
			const categoryResult = await queryRunner.manager.delete(Category, {});

			// 7. Delete all users except admin
			const userResult = await queryRunner.manager.delete(User, {
				id: Not(adminUser.id),
			});

			// 8. Reset admin XP and streak
			await queryRunner.manager.update(
				User,
				{
					id: adminUser.id,
				},
				{
					xp: 0,
					streak: 0,
					interests: [],
				},
			);

			await queryRunner.commitTransaction();

			return {
				cardsDeleted: cardResult.affected ?? 0,
				decksDeleted: deckResult.affected ?? 0,
				categoriesDeleted: categoryResult.affected ?? 0,
				usersDeleted: userResult.affected ?? 0,
				interactionsDeleted: interactionResult.affected ?? 0,
				xpEventsDeleted: xpResult.affected ?? 0,
			};
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}
}
