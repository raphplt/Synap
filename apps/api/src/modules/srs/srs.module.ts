import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserCardInteraction } from "./user-card-interaction.entity"
import { SrsService } from "./srs.service"
import { SrsController } from "./srs.controller"

@Module({
	imports: [TypeOrmModule.forFeature([UserCardInteraction])],
	providers: [SrsService],
	controllers: [SrsController],
	exports: [SrsService],
})
export class SrsModule {}
