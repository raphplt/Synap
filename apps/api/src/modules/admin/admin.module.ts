import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Card } from "../cards/card.entity";
import { Deck } from "../decks/deck.entity";
import { Category } from "../decks/category.entity";
import { User } from "../users/user.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { XpEvent } from "../gamification/xp-event.entity";
import { UserCategoryProgress } from "../gamification/user-category-progress.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Card,
			Deck,
			Category,
			User,
			UserCardInteraction,
			XpEvent,
			UserCategoryProgress,
		]),
	],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
