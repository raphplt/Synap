import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { DecksService } from "./decks.service";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("decks")
export class DecksController {
	constructor(private readonly decksService: DecksService) {}

	@Public()
	@Get()
	async getAllDecks() {
		return await this.decksService.findAllDecks();
	}

	@Public()
	@Get("categories")
	async getAllCategories() {
		return await this.decksService.findAllCategories();
	}

	@Public()
	@Get(":slug")
	async getDeckBySlug(@Param("slug") slug: string) {
		return await this.decksService.findDeckBySlug(slug);
	}

	@Public()
	@Get("category/:categoryId")
	async getDecksByCategory(@Param("categoryId") categoryId: string) {
		return await this.decksService.getDecksByCategory(categoryId);
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
