import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../cards/card.entity';
import { WikiModule } from '../wiki/wiki.module';
import { FeedController } from './feed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card]),
    WikiModule,
  ],
  controllers: [FeedController],
})
export class FeedModule {}
