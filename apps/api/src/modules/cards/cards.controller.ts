import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
} from "@nestjs/common";
import { IsInt, Min, Max } from "class-validator";
import { CardsService } from "./cards.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

class RateCardDto {
	@IsInt()
	@Min(-1)
	@Max(1)
	rating!: number;
}

@Controller("cards")
export class CardsController {
	constructor(private readonly cardsService: CardsService) {}

	/**
	 * Get all cards (paginated, for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string
	) {
		return await this.cardsService.findAllPaginated(page, limit, search);
	}

	/**
	 * Get single card by ID
	 */
	@UseGuards(JwtAuthGuard)
	@Get(":id")
	async getById(@Param("id") id: string) {
		return await this.cardsService.findById(id);
	}

	/**
	 * Create a new card
	 */
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(
		@Body()
		body: {
			title: string;
			summary: string;
			content: string;
			mediaUrl?: string;
			sourceLink?: string;
			origin?: string;
			qualityScore?: number;
			deckId?: string;
		}
	) {
		return await this.cardsService.create({
			title: body.title,
			summary: body.summary,
			content: body.content,
			mediaUrl: body.mediaUrl ?? "",
			sourceLink: body.sourceLink ?? `synap://admin/${Date.now()}`,
			origin: (body.origin as "CURATED") ?? "CURATED",
			qualityScore: body.qualityScore ?? 80,
			deckId: body.deckId,
		});
	}

	/**
	 * Update a card
	 */
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	async update(
		@Param("id") id: string,
		@Body()
		body: Partial<{
			title: string;
			summary: string;
			content: string;
			mediaUrl: string;
			qualityScore: number;
			deckId: string;
		}>
	) {
		return await this.cardsService.update(id, body);
	}

	/**
	 * Delete a card
	 */
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	async delete(@Param("id") id: string) {
		await this.cardsService.delete(id);
		return { success: true };
	}

	/**
	 * Rate a card
	 */
	@Patch(":id/rate")
	@HttpCode(HttpStatus.OK)
	async rate(@Param("id") id: string, @Body() body: RateCardDto) {
		return await this.cardsService.rateCard(id, body.rating);
	}
}
