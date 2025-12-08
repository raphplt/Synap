import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WikiIngestService {
  private readonly logger = new Logger(WikiIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async fetchAndStore(count: number = 10): Promise<void> {
    this.logger.log(`Fetching ${count} new cards from Wikipedia...`);

    try {
      // Wikipedia API (French)
      const url = 'https://fr.wikipedia.org/w/api.php';
      
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            action: 'query',
            format: 'json',
            generator: 'random',
            grnnamespace: 0, // Main articles
            grnlimit: count * 2, // Fetch double to account for filtering
            prop: 'extracts|pageimages',
            exintro: 1,
            explaintext: 1,
            pithumbsize: 1080, // High res
            origin: '*',
          },
        })
      );

      if (!data.query || !data.query.pages) {
        this.logger.warn('No pages returned from Wikipedia.');
        return;
      }

      const pages = Object.values(data.query.pages);
      const newCards: Partial<Card>[] = [];

      for (const page of pages as any[]) {
        // --- TikTok Quality Gate ---
        if (!page.thumbnail || !page.thumbnail.source) continue; // Must have image
        if (!page.extract || page.extract.length < 100) continue; // Must have content

        const card: Partial<Card> = {
          title: page.title,
          summary: page.extract.substring(0, 150) + '...',
          content: `# ${page.title}\n\n${page.extract}`,
          type: 'LEARN', // Default to LEARN
          category: 'General', // Could map categories if enabled
          difficultyLevel: Math.floor(Math.random() * 5) + 1, // Random difficulty for now
          mediaUrl: page.thumbnail.source,
          sourceLink: `https://fr.wikipedia.org/?curid=${page.pageid}`,
          tags: ['wikipedia', 'random', 'learn'],
        };

        newCards.push(card);
        if (newCards.length >= count) break;
      }

      if (newCards.length > 0) {
        await this.cardRepository.save(newCards);
        this.logger.log(`Successfully stored ${newCards.length} new cards.`);
      } else {
        this.logger.warn('No valid cards found after filtering.');
      }

    } catch (error) {
      this.logger.error('Error fetching from Wikipedia', error);
      // Fail gracefully - app continues with existing data
    }
  }
}
