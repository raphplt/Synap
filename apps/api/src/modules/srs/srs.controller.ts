import { Controller, Post, Body, Get, Request, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { SrsService, SrsRating } from "./srs.service"
import { GamificationService } from "../gamification/gamification.service";
import { IsString, IsIn, IsOptional } from "class-validator";

class ReviewCardDto {
	@IsString()
	cardId!: string;

	@IsIn(["AGAIN", "HARD", "GOOD", "EASY"])
	rating!: SrsRating;

	@IsOptional()
	@IsString()
	deckId?: string;

	@IsOptional()
	@IsString()
	categoryId?: string;
}

@Controller("srs")
@UseGuards(JwtAuthGuard)
export class SrsController {
	constructor(
		private readonly srsService: SrsService,
		private readonly gamificationService: GamificationService
	) {}

	@Post("review")
	async reviewCard(
		@Request() req: { user: { id: string } },
		@Body() dto: ReviewCardDto
	) {
		const interaction = await this.srsService.processReview(
			req.user.id,
			dto.cardId,
			dto.rating
		);

		// Update streak on activity
		await this.gamificationService.updateStreak(req.user.id);

		// Determine XP event type based on rating and result
		let xpResult = null;
		const metadata = {
			cardId: dto.cardId,
			deckId: dto.deckId,
			categoryId: dto.categoryId,
		};

		if (dto.rating === "AGAIN" || dto.rating === "HARD") {
			// Forgot or struggled
			xpResult = await this.gamificationService.awardXp(
				req.user.id,
				"CARD_FORGOT",
				metadata
			);
		} else {
			// Retained (GOOD or EASY)
			xpResult = await this.gamificationService.awardXp(
				req.user.id,
				"CARD_RETAINED",
				metadata
			);

			// Check if card became GOLD
			if (interaction.status === "GOLD") {
				await this.gamificationService.awardXp(req.user.id, "CARD_GOLD", metadata);
			}
		}

		return {
			...interaction,
			xp: xpResult,
		};
	}

	@Get("due")
	async getCardsDue(@Request() req: { user: { id: string } }) {
		return await this.srsService.getCardsDueForReview(req.user.id);
	}

	@Get("learning")
	async getLearningCards(@Request() req: { user: { id: string } }) {
		return await this.srsService.getLearningCards(req.user.id);
	}

	@Get("progress")
	async getProgress(@Request() req: { user: { id: string } }) {
		return await this.srsService.getUserProgress(req.user.id);
	}
}

