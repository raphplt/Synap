import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { WikiIngestService } from './wiki.service';
import { WikiController } from './wiki.controller';

@Module({
  imports: [CardsModule],
  providers: [WikiIngestService],
  controllers: [WikiController],
  exports: [WikiIngestService]
})
export class WikiModule {}
