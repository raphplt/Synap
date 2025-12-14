import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CardsService } from '../cards/cards.service';
import { WikiIngestService } from './wiki.service';

const DEFAULT_SEED_TITLES = [
  'Tour Eiffel',
  'Albert Einstein',
  'Marie Curie',
  'Système solaire',
  'Internet',
  'Renaissance',
  'ADN',
  'Évolution (biologie)',
  'Mona Lisa',
  'Égypte antique'
];

@Injectable()
export class WikiSeedService implements OnModuleInit {
  private readonly logger = new Logger(WikiSeedService.name);

  constructor(
    private readonly cardsService: CardsService,
    private readonly wikiService: WikiIngestService
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled = process.env.MEMEX_SEED_ON_BOOT ?? 'true';
    if (enabled === 'false') return;

    try {
      const count = await this.cardsService.countCards();
      if (count > 0) return;

      this.logger.log('DB vide: seed automatique via Wikipédia…');
      await this.wikiService.ingestTitles(DEFAULT_SEED_TITLES);
    } catch (error) {
      this.logger.warn(`Seed ignoré: ${String(error)}`);
    }
  }
}

