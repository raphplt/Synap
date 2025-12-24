import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	Request,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
} from "@nestjs/common";
import { DecksService } from "./decks.service";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("decks")
export class DecksController {
	constructor(private readonly decksService: DecksService) {}

	/**
	 * Get all decks (paginated for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get("admin")
	async getAllPaginated(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string
	) {
		return await this.decksService.findAllDecksPaginated(page, limit, search);
	}

	/**
	 * Public: Get all active decks
	 */
	@Public()
	@Get()
	async getAllDecks() {
		return await this.decksService.findAllDecks();
	}

	/**
	 * Public: Get all categories
	 */
	@Public()
	@Get("categories")
	async getAllCategories() {
		return await this.decksService.findAllCategories();
	}

	/**
	 * Get all categories (paginated for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get("categories/admin")
	async getAllCategoriesPaginated(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string
	) {
		return await this.decksService.findAllCategoriesPaginated(
			page,
			limit,
			search
		);
	}

	/**
	 * Create a deck
	 */
	@UseGuards(JwtAuthGuard)
	@Post()
	async createDeck(
		@Body()
		body: {
			name: string;
			slug: string;
			description: string;
			imageUrl?: string;
			categoryId?: string;
			isActive?: boolean;
		}
	) {
		return await this.decksService.createDeck({
			name: body.name,
			slug: body.slug,
			description: body.description,
			imageUrl: body.imageUrl ?? "",
			categoryId: body.categoryId,
			isActive: body.isActive ?? true,
			cardCount: 0,
			sortOrder: 0,
		});
	}

	/**
	 * Update a deck
	 */
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	async updateDeck(
		@Param("id") id: string,
		@Body()
		body: Partial<{
			name: string;
			slug: string;
			description: string;
			imageUrl: string;
			categoryId: string;
			isActive: boolean;
		}>
	) {
		return await this.decksService.updateDeck(id, body);
	}

	/**
	 * Delete a deck
	 */
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	async deleteDeck(@Param("id") id: string) {
		await this.decksService.deleteDeck(id);
		return { success: true };
	}

	/**
	 * Public: Get deck by slug
	 */
	@Public()
	@Get(":slug")
	async getDeckBySlug(@Param("slug") slug: string) {
		return await this.decksService.findDeckBySlug(slug);
	}

	/**
	 * Public: Get decks by category
	 */
	@Public()
	@Get("category/:categoryId")
	async getDecksByCategory(@Param("categoryId") categoryId: string) {
		return await this.decksService.getDecksByCategory(categoryId);
	}
}

@Controller("categories")
export class CategoriesController {
	constructor(private readonly decksService: DecksService) {}

	/**
	 * Get all categories (paginated for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllPaginated(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string
	) {
		return await this.decksService.findAllCategoriesPaginated(
			page,
			limit,
			search
		);
	}

	/**
	 * Create a category
	 */
	@UseGuards(JwtAuthGuard)
	@Post()
	async createCategory(
		@Body()
		body: {
			name: string;
			slug: string;
			description?: string;
			imageUrl?: string;
		}
	) {
		return await this.decksService.createCategory({
			name: body.name,
			slug: body.slug,
			description: body.description,
			imageUrl: body.imageUrl,
			sortOrder: 0,
		});
	}

	/**
	 * Update a category
	 */
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	async updateCategory(
		@Param("id") id: string,
		@Body()
		body: Partial<{
			name: string;
			slug: string;
			description: string;
			imageUrl: string;
		}>
	) {
		return await this.decksService.updateCategory(id, body);
	}

	/**
	 * Delete a category
	 */
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	async deleteCategory(@Param("id") id: string) {
		await this.decksService.deleteCategory(id);
		return { success: true };
	}
}

@Controller("atlas")
export class AtlasController {
	constructor(private readonly decksService: DecksService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getAtlas(@Request() req: { user: { id: string } }) {
		return await this.decksService.getAtlasStats(req.user.id);
	}
}
