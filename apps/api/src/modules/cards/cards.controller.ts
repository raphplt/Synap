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
	Request,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
} from "@nestjs/common";
import { IsInt, Min, Max } from "class-validator";
import { CardsService } from "./cards.service";
import { BookmarksService } from "./bookmarks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

class RateCardDto {
	@IsInt()
	@Min(-1)
	@Max(1)
	rating!: number;
}

@Controller("cards")
export class CardsController {
	constructor(
		private readonly cardsService: CardsService,
		private readonly bookmarksService: BookmarksService,
	) {}

	/**
	 * Get all cards (paginated, for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string,
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
			title: string
			summary: string
			content: string
			mediaUrl?: string
			sourceLink?: string
			origin?: string
			qualityScore?: number
			deckId?: string
		},
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
			title: string
			summary: string
			content: string
			mediaUrl: string
			qualityScore: number
			deckId: string
		}>,
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

	// ==================== LIKE/BOOKMARK ENDPOINTS ====================

	/**
	 * Toggle like on a card
	 */
	@UseGuards(JwtAuthGuard)
	@Post(":id/like")
	@HttpCode(HttpStatus.OK)
	async toggleLike(@Param("id") cardId: string, @Request() req: { user: { id: string } }) {
		return await this.bookmarksService.toggle(req.user.id, cardId, "LIKE");
	}

	/**
	 * Toggle bookmark on a card
	 */
	@UseGuards(JwtAuthGuard)
	@Post(":id/bookmark")
	@HttpCode(HttpStatus.OK)
	async toggleBookmark(@Param("id") cardId: string, @Request() req: { user: { id: string } }) {
		return await this.bookmarksService.toggle(req.user.id, cardId, "BOOKMARK");
	}

	/**
	 * Get like/bookmark status for a card
	 */
	@UseGuards(JwtAuthGuard)
	@Get(":id/bookmark-status")
	async getBookmarkStatus(@Param("id") cardId: string, @Request() req: { user: { id: string } }) {
		return await this.bookmarksService.getStatus(req.user.id, cardId);
	}

	/**
	 * Get user's bookmarked cards
	 */
	@UseGuards(JwtAuthGuard)
	@Get("bookmarks/me")
	async getMyBookmarks(
		@Request() req: { user: { id: string } },
		@Query("type") type?: "LIKE" | "BOOKMARK",
	) {
		return await this.bookmarksService.getUserBookmarks(req.user.id, type);
	}
}
