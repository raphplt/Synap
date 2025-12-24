import { Controller, Get, Param } from "@nestjs/common"
import { DecksService } from "./decks.service"
import { Public } from "../auth/decorators/public.decorator"

@Controller("decks")
export class DecksController {
	constructor (private readonly decksService: DecksService) {}

	@Public()
	@Get()
	async getAllDecks () {
		return await this.decksService.findAllDecks()
	}

	@Public()
	@Get("categories")
	async getAllCategories () {
		return await this.decksService.findAllCategories()
	}

	@Public()
	@Get(":slug")
	async getDeckBySlug (@Param("slug") slug: string) {
		return await this.decksService.findDeckBySlug(slug)
	}

	@Public()
	@Get("category/:categoryId")
	async getDecksByCategory (@Param("categoryId") categoryId: string) {
		return await this.decksService.getDecksByCategory(categoryId)
	}
}
