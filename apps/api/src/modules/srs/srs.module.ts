import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserCardInteraction } from "./user-card-interaction.entity";
import { SrsService } from "./srs.service";
import { SrsController } from "./srs.controller";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([UserCardInteraction]),
		forwardRef(() => GamificationModule),
	],
	providers: [SrsService],
	controllers: [SrsController],
	exports: [SrsService],
})
export class SrsModule {}
