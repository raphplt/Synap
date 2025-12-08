import { Controller, Get, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';
import { WikiIngestService } from '../wiki/wiki.service';

@Controller('feed')
export class FeedController {
  private readonly logger = new Logger(FeedController.name);

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly wikiService: WikiIngestService,
  ) {}

  @Get()
  async getFeed() {
    this.logger.log('GET /feed requested');

    // --- Smart Feed Logic ---
    const count = await this.cardRepository.count();

    if (count < 10) {
      this.logger.log(`Low card count (${count}). Triggering ingestion...`);
      await this.wikiService.fetchAndStore(10);
    }

    // Return latest cards
    return this.cardRepository.find({
      take: 20,
      order: { createdAt: 'DESC' },
    });
  }
}
