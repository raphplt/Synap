import {
	Controller,
	Post,
	Get,
	Body,
	UseGuards,
	Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GamificationService } from "./gamification.service";
import { type XpEventType } from "./xp-event.entity";

interface AwardXpDto {
	reason: XpEventType
	cardId?: string
	deckId?: string
	categoryId?: string
}

@Controller("gamification")
export class GamificationController {
	constructor (private readonly gamificationService: GamificationService) {}

	/**
	 * Award XP for an action
	 */
	@UseGuards(JwtAuthGuard)
	@Post("action")
	async awardXp (
	@Request() req: { user: { id: string } },
		@Body() body: AwardXpDto,
	) {
		// Update streak on any activity
		await this.gamificationService.updateStreak(req.user.id);

		// Award XP
		const result = await this.gamificationService.awardXp(
			req.user.id,
			body.reason,
			{
				cardId: body.cardId,
				deckId: body.deckId,
				categoryId: body.categoryId,
			},
		);

		return result;
	}

	/**
	 * Get user XP stats
	 */
	@UseGuards(JwtAuthGuard)
	@Get("stats")
	async getStats (@Request() req: { user: { id: string } }) {
		return await this.gamificationService.getXpStats(req.user.id);
	}

	/**
	 * Get activity heatmap data
	 */
	@UseGuards(JwtAuthGuard)
	@Get("heatmap")
	async getHeatmap (@Request() req: { user: { id: string } }) {
		return await this.gamificationService.getActivityHeatmap(req.user.id);
	}
}
