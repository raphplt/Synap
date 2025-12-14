import { Injectable, Logger } from '@nestjs/common';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/card.entity';

interface WikipediaApiResponse {
  title: string;
  extract: string;
  extract_html?: string;
  content_urls: {
    desktop?: { page: string };
    mobile?: { page: string };
  };
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
}

@Injectable()
export class WikiIngestService {
  private readonly logger = new Logger(WikiIngestService.name);

  constructor(private readonly cardsService: CardsService) {}

  private cleanText(text: string): string {
    return text
      .replace(/\[\d+\]/g, '') // remove references [1]
      .replace(/\{\{[^}]+\}\}/g, '') // remove templates
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private pickMediaUrl(payload: WikipediaApiResponse): string {
    if (payload.thumbnail == null || payload.thumbnail.width < 500) {
      throw new Error('Thumbnail manquante ou trop petite (<500px).');
    }

    return payload.originalimage?.source ?? payload.thumbnail.source;
  }

  async fetchSummary(title: string): Promise<WikipediaApiResponse> {
    const encoded = encodeURIComponent(title);
    const response = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { accept: 'application/json' }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Wiki API error (${response.status}): ${body}`);
    }

    return (await response.json()) as WikipediaApiResponse;
  }

  async ingestTitle(title: string): Promise<Card> {
    const raw = await this.fetchSummary(title);

    const mediaUrl = this.pickMediaUrl(raw);
    const extract = this.cleanText(raw.extract ?? '');

    if (extract.length === 0) {
      throw new Error('Contenu insuffisant après nettoyage.');
    }

    const sourceLink =
      raw.content_urls?.mobile?.page ??
      raw.content_urls?.desktop?.page ??
      `https://fr.wikipedia.org/wiki/${encodeURIComponent(raw.title)}`;

    const payload = {
      title: raw.title,
      summary: extract,
      content: extract,
      mediaUrl,
      sourceLink,
      sourceAttribution: 'Contenu Wikipédia – CC BY-SA 3.0'
    };

    const card = await this.cardsService.upsertCard(payload);
    this.logger.log(`Ingestion réussie: ${raw.title}`);
    return card;
  }

  async ingestTitles(titles: string[]): Promise<Card[]> {
    const results: Card[] = [];
    for (const title of titles) {
      try {
        const card = await this.ingestTitle(title);
        results.push(card);
      } catch (error) {
        this.logger.warn(`Ingestion ignorée pour "${title}": ${String(error)}`);
      }
    }
    return results;
  }
}
