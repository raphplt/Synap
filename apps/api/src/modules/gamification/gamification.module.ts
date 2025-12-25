import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { XpEvent } from "./xp-event.entity";
import { UserCategoryProgress } from "./user-category-progress.entity";
import { GamificationService } from "./gamification.service";
import { GamificationController } from "./gamification.controller";
import { User } from "../users/user.entity";

@Module({
	imports: [TypeOrmModule.forFeature([XpEvent, UserCategoryProgress, User])],
	providers: [GamificationService],
	controllers: [GamificationController],
	exports: [GamificationService],
})
export class GamificationModule {}
