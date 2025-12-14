import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { CardsService } from '../cards/cards.service'
import { WikiIngestService } from './wiki.service'

@Injectable()
export class WikiSeedService implements OnModuleInit {
  private readonly logger = new Logger(WikiSeedService.name)

  constructor (
    private readonly cardsService: CardsService,
    private readonly wikiService: WikiIngestService
  ) {}

  async onModuleInit (): Promise<void> {
    const enabled = process.env.MEMEX_SEED_ON_BOOT ?? 'true'
    if (enabled === 'false') return

    try {
      const count = await this.cardsService.countCards()
      if (count > 0) return

      const seedCount = Math.min(50, Math.max(1, Number(process.env.MEMEX_SEED_COUNT ?? 20)))
      this.logger.log(`DB vide: seed automatique via Wikipédia (random x${seedCount})…`)
      await this.wikiService.ingestRandom(seedCount)
    } catch (error) {
      this.logger.warn(`Seed ignoré: ${String(error)}`)
    }
  }
}
