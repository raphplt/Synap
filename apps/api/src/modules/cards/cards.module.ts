import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./card.entity";
import { UserCardView } from "./user-card-view.entity";
import { CardsService } from "./cards.service";
import { CardViewsService } from "./card-views.service";
import { CardsController } from "./cards.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Card, UserCardView])],
	providers: [CardsService, CardViewsService],
	controllers: [CardsController],
	exports: [CardsService, CardViewsService],
})
export class CardsModule {}
