import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../cards/card.entity';
import { WikiIngestService } from './wiki.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Card]),
  ],
  providers: [WikiIngestService],
  exports: [WikiIngestService],
})
export class WikiModule {}
