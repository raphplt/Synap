import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardsModule } from "./modules/cards/cards.module";
import { FeedModule } from "./modules/feed/feed.module";
import { WikiModule } from "./modules/wiki/wiki.module";
import { Card } from "./modules/cards/card.entity";
import { AppController } from "./app.controller";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		TypeOrmModule.forRoot({
			type: "postgres",
			url: process.env.DATABASE_URL ?? "postgresql://memex:memex@localhost:5432/memex",
			entities: [Card],
			synchronize: true,
			autoLoadEntities: true,
			logging: false,
		}),
		CardsModule,
		FeedModule,
		WikiModule,
	],
	controllers: [AppController],
})
export class AppModule {}
