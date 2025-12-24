import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "../cards/card.entity";
import { Deck } from "../decks/deck.entity";
import { Category } from "../decks/category.entity";
import { User } from "../users/user.entity";
import { SeedService } from "./seed.service";
import { SeedController } from "./seed.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Card, Deck, Category, User])],
	providers: [SeedService],
	controllers: [SeedController],
	exports: [SeedService],
})
export class SeedModule {}
