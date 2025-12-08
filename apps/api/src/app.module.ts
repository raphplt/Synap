import { Module } from '@nestjs/common';
import { FeedModule } from "./feed/feed.module";
import { WikiModule } from "./wiki/wiki.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./cards/card.entity";

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "user",
			password: "password",
			database: "memex",
			autoLoadEntities: true,
			synchronize: true,
		}),
		TypeOrmModule.forFeature([Card]),
		FeedModule,
		WikiModule,
	],
})
export class AppModule {}
