import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { XpEvent, type XpEventType } from "./xp-event.entity";
import { UserCategoryProgress } from "./user-category-progress.entity";
import { User } from "../users/user.entity";

// XP values for each action
export const XP_VALUES: Record<XpEventType, number> = {
	CARD_VIEW: 5,
	CARD_RETAINED: 10,
	CARD_FORGOT: 2,
	CARD_GOLD: 50,
	DECK_COMPLETE: 100,
	QUIZ_SUCCESS: 25,
	STREAK_7: 200,
	STREAK_30: 1000,
	STREAK_BONUS: 50,
};

export interface XpStats {
	global: {
		xp: number
		level: number
		xpForNextLevel: number
		progress: number
	}
	streak: {
		current: number
		multiplier: number
	}
	byCategory: Array<{
		categoryId: string
		categoryName: string
		xp: number
		level: number
		cardsCompleted: number
		cardsGold: number
	}>
}

@Injectable()
export class GamificationService {
	constructor (
		@InjectRepository(XpEvent)
		private readonly xpEventRepository: Repository<XpEvent>,
		@InjectRepository(UserCategoryProgress)
		private readonly progressRepository: Repository<UserCategoryProgress>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * Calculate level from XP using exponential formula
	 * Level 1: 0 XP, Level 2: 100 XP, Level 10: ~6500 XP, Level 50: ~125000 XP
	 */
	calculateLevel (xp: number): number {
		return Math.floor(Math.pow(xp / 100, 0.5)) + 1;
	}

	/**
	 * Calculate XP required for a specific level
	 */
	xpForLevel (level: number): number {
		return Math.pow(level - 1, 2) * 100;
	}

	/**
	 * Get streak multiplier (increases rewards for consistency)
	 */
	getStreakMultiplier (streak: number): number {
		if (streak <= 1) return 1.0;
		if (streak <= 7) return 1 + streak * 0.1; // 1.1 to 1.7
		if (streak <= 30) return 1.7 + (streak - 7) * 0.05; // 1.7 to 2.85
		return 3.0; // Max multiplier
	}

	/**
	 * Award XP to a user
	 */
	async awardXp (
		userId: string,
		reason: XpEventType,
		metadata?: { cardId?: string, deckId?: string, categoryId?: string },
	): Promise<{ xpAwarded: number, newTotal: number, levelUp: boolean }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new Error("User not found");

		// Base XP amount
		const baseXp = XP_VALUES[reason] ?? 0;

		// Apply streak multiplier for relevant actions
		const streakActions: XpEventType[] = [
			"CARD_RETAINED",
			"CARD_GOLD",
			"DECK_COMPLETE",
			"QUIZ_SUCCESS",
		];
		let multiplier = 1;
		if (streakActions.includes(reason)) {
			multiplier = this.getStreakMultiplier(user.streak);
		}

		const xpAwarded = Math.round(baseXp * multiplier);
		const oldLevel = this.calculateLevel(user.xp);
		const newTotal = user.xp + xpAwarded;
		const newLevel = this.calculateLevel(newTotal);

		// Update user XP
		await this.userRepository.update(userId, { xp: newTotal });

		// Log the event
		await this.xpEventRepository.save({
			userId,
			amount: xpAwarded,
			reason,
			metadata,
		});

		// Update category progress if categoryId provided
		if (metadata?.categoryId) {
			await this.updateCategoryProgress(userId, metadata.categoryId, xpAwarded, reason);
		}

		return {
			xpAwarded,
			newTotal,
			levelUp: newLevel > oldLevel,
		};
	}

	/**
	 * Update user's category-specific progress
	 */
	private async updateCategoryProgress (
		userId: string,
		categoryId: string,
		xpGain: number,
		reason: XpEventType,
	): Promise<void> {
		let progress = await this.progressRepository.findOne({
			where: { userId, categoryId },
		});

		if (!progress) {
			progress = this.progressRepository.create({
				userId,
				categoryId,
				xp: 0,
				level: 1,
				cardsCompleted: 0,
				cardsGold: 0,
			});
		}

		progress.xp += xpGain;
		progress.level = this.calculateLevel(progress.xp);

		// Increment counters based on action
		if (reason === "CARD_RETAINED" || reason === "CARD_VIEW") {
			progress.cardsCompleted += 1;
		}
		if (reason === "CARD_GOLD") {
			progress.cardsGold += 1;
		}

		await this.progressRepository.save(progress);
	}

	/**
	 * Update streak for a user (called on daily activity)
	 */
	async updateStreak (userId: string): Promise<{ streak: number, bonus: number }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new Error("User not found");

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const lastActivity = user.lastActivityAt
			? new Date(
				user.lastActivityAt.getFullYear(),
				user.lastActivityAt.getMonth(),
				user.lastActivityAt.getDate(),
			  )
			: null;

		let newStreak = user.streak;
		let bonusXp = 0;

		if (!lastActivity) {
			// First activity ever
			newStreak = 1;
		} else {
			const daysDiff = Math.floor(
				(today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (daysDiff === 0) {
				// Same day, no streak update needed
				return { streak: user.streak, bonus: 0 };
			} else if (daysDiff === 1) {
				// Consecutive day
				newStreak = user.streak + 1;

				// Award streak bonuses at milestones
				if (newStreak === 7) {
					const result = await this.awardXp(userId, "STREAK_7");
					bonusXp = result.xpAwarded;
				} else if (newStreak === 30) {
					const result = await this.awardXp(userId, "STREAK_30");
					bonusXp = result.xpAwarded;
				}
			} else {
				// Streak broken
				newStreak = 1;
			}
		}

		// Update user
		await this.userRepository.update(userId, {
			streak: newStreak,
			lastActivityAt: now,
		});

		return { streak: newStreak, bonus: bonusXp };
	}

	/**
	 * Get complete XP stats for a user
	 */
	async getXpStats (userId: string): Promise<XpStats> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			return {
				global: { xp: 0, level: 1, xpForNextLevel: 100, progress: 0 },
				streak: { current: 0, multiplier: 1 },
				byCategory: [],
			};
		}

		const level = this.calculateLevel(user.xp);
		const currentLevelXp = this.xpForLevel(level);
		const nextLevelXp = this.xpForLevel(level + 1);
		const progress = (user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp);

		const categoryProgress = await this.progressRepository.find({
			where: { userId },
			relations: ["category"],
		});

		return {
			global: {
				xp: user.xp,
				level,
				xpForNextLevel: nextLevelXp,
				progress: Math.min(1, Math.max(0, progress)),
			},
			streak: {
				current: user.streak,
				multiplier: this.getStreakMultiplier(user.streak),
			},
			byCategory: categoryProgress.map((p) => ({
				categoryId: p.categoryId,
				categoryName: p.category?.name ?? "Unknown",
				xp: p.xp,
				level: p.level,
				cardsCompleted: p.cardsCompleted,
				cardsGold: p.cardsGold,
			})),
		};
	}

	/**
	 * Get activity history for heatmap (last 365 days)
	 */
	async getActivityHeatmap (
		userId: string,
	): Promise<Array<{ date: string, count: number }>> {
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

		const events = await this.xpEventRepository
			.createQueryBuilder("event")
			.select("DATE(event.createdAt)", "date")
			.addSelect("COUNT(*)", "count")
			.where("event.userId = :userId", { userId })
			.andWhere("event.createdAt >= :startDate", { startDate: oneYearAgo })
			.groupBy("DATE(event.createdAt)")
			.orderBy("date", "ASC")
			.getRawMany();

		return events.map((e) => ({
			date: e.date,
			count: parseInt(e.count, 10),
		}));
	}
}
