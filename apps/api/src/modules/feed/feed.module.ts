import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "../cards/card.entity";
import { UserCardView } from "../cards/user-card-view.entity";
import { UserCardInteraction } from "../srs/user-card-interaction.entity";
import { WikiModule } from "../wiki/wiki.module";
import { CardsModule } from "../cards/cards.module";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Card, UserCardInteraction, UserCardView]),
		WikiModule,
		CardsModule,
	],
	controllers: [FeedController],
	providers: [FeedService],
})
export class FeedModule {}
