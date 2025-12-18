import { Module } from "@nestjs/common";
import { CardsModule } from "../cards/cards.module";
import { WikiIngestService } from "./wiki.service";
import { WikiController } from "./wiki.controller";
import { WikiSeedService } from "./wiki.seed";

@Module({
	imports: [CardsModule],
	providers: [WikiIngestService, WikiSeedService],
	controllers: [WikiController],
	exports: [WikiIngestService],
})
export class WikiModule {}
