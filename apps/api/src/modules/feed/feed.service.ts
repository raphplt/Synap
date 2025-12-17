import { Injectable, Logger } from '@nestjs/common'
import { CardsService } from '../cards/cards.service'
import { WikiIngestService } from '../wiki/wiki.service'

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name)
  private filling = false

  constructor (
    private readonly cardsService: CardsService,
    private readonly wikiService: WikiIngestService
  ) {}

  private getBufferMin (): number {
    const value = Number(process.env.MEMEX_FEED_BUFFER_MIN ?? 200)
    return Number.isFinite(value) ? Math.max(0, value) : 200
  }

  private getFillBatchSize (): number {
    const value = Number(process.env.MEMEX_FEED_FILL_BATCH ?? 50)
    const clamped = Number.isFinite(value) ? value : 50
    return Math.min(100, Math.max(1, clamped))
  }

  private async ensureBuffer (): Promise<void> {
    if (this.filling) return

    const min = this.getBufferMin()
    if (min <= 0) return

    this.filling = true
    try {
      const count = await this.cardsService.countCards()
      if (count >= min) return

      const toFetch = Math.min(min - count, this.getFillBatchSize())
      this.logger.log(`Buffer Wiki: ${count}/${min} -> ingest random x${toFetch}`)
      await this.wikiService.ingestRandom(toFetch)
    } catch (error) {
      this.logger.warn(`ensureBuffer failed: ${String(error)}`)
    } finally {
      this.filling = false
    }
  }

  async getFeed (cursor: number, take: number) {
    void this.ensureBuffer()
    return await this.cardsService.getFeed(cursor, take)
  }
}
