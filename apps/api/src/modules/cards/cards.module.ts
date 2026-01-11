import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./card.entity";
import { UserCardView } from "./user-card-view.entity";
import { UserCardBookmark } from "./user-card-bookmark.entity";
import { CardsService } from "./cards.service";
import { CardViewsService } from "./card-views.service";
import { BookmarksService } from "./bookmarks.service";
import { CardsController } from "./cards.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Card, UserCardView, UserCardBookmark])],
	providers: [CardsService, CardViewsService, BookmarksService],
	controllers: [CardsController],
	exports: [CardsService, CardViewsService, BookmarksService],
})
export class CardsModule {}
