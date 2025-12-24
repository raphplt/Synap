import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Deck } from "./deck.entity"
import { Category } from "./category.entity"
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { DecksService } from "./decks.service"
import {
	DecksController,
	AtlasController,
	CategoriesController,
} from "./decks.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Deck, Category, UserCardInteraction])],
	providers: [DecksService],
	controllers: [DecksController, AtlasController, CategoriesController],
	exports: [DecksService],
})
export class DecksModule {}
