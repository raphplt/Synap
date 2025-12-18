import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
} from "@nestjs/common";
import { IsInt, Min, Max } from "class-validator";
import { CardsService } from "./cards.service";

class RateCardDto {
	@IsInt()
	@Min(-1)
	@Max(1)
		rating!: number;
}

@Controller("cards")
export class CardsController {
	constructor (private readonly cardsService: CardsService) {}

	@Patch(":id/rate")
	@HttpCode(HttpStatus.OK)
	async rate (@Param("id") id: string, @Body() body: RateCardDto) {
		return await this.cardsService.rateCard(id, body.rating);
	}
}
