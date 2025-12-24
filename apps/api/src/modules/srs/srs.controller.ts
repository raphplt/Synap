import { Controller, Post, Body, Get, Request, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { SrsService, SrsRating } from "./srs.service"
import { IsString, IsIn } from "class-validator"

class ReviewCardDto {
	@IsString()
		cardId!: string

	@IsIn(["AGAIN", "HARD", "GOOD", "EASY"])
		rating!: SrsRating
}

@Controller("srs")
@UseGuards(JwtAuthGuard)
export class SrsController {
	constructor (private readonly srsService: SrsService) {}

	@Post("review")
	async reviewCard (
		@Request() req: { user: { id: string } },
		@Body() dto: ReviewCardDto,
	) {
		return await this.srsService.processReview(
			req.user.id,
			dto.cardId,
			dto.rating,
		)
	}

	@Get("due")
	async getCardsDue (@Request() req: { user: { id: string } }) {
		return await this.srsService.getCardsDueForReview(req.user.id)
	}

	@Get("learning")
	async getLearningCards (@Request() req: { user: { id: string } }) {
		return await this.srsService.getLearningCards(req.user.id)
	}

	@Get("progress")
	async getProgress (@Request() req: { user: { id: string } }) {
		return await this.srsService.getUserProgress(req.user.id)
	}
}
