import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD } from "@nestjs/core";
import { CardsModule } from "./modules/cards/cards.module";
import { FeedModule } from "./modules/feed/feed.module";
import { WikiModule } from "./modules/wiki/wiki.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/users/user.module";
import { SrsModule } from "./modules/srs/srs.module";
import { DecksModule } from "./modules/decks/decks.module";
import { Card } from "./modules/cards/card.entity";
import { User } from "./modules/users/user.entity";
import { UserCardInteraction } from "./modules/srs/user-card-interaction.entity";
import { Deck } from "./modules/decks/deck.entity";
import { Category } from "./modules/decks/category.entity";
import { AppController } from "./app.controller";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		TypeOrmModule.forRoot({
			type: "postgres",
			url:
				process.env.DATABASE_URL ?? "postgresql://memex:memex@localhost:5432/memex",
			entities: [Card, User, UserCardInteraction, Deck, Category],
			synchronize: true,
			autoLoadEntities: true,
			logging: false,
		}),
		AuthModule,
		UserModule,
		SrsModule,
		DecksModule,
		CardsModule,
		FeedModule,
		WikiModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
