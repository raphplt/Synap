import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { WikiModule } from '../wiki/wiki.module';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [CardsModule, WikiModule],
  controllers: [FeedController],
  providers: [FeedService]
})
export class FeedModule {}

