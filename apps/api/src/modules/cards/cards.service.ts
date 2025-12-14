import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCardInput, FeedResponseDto } from '@memex/shared';
import { Repository } from 'typeorm';
import { Card } from './card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardsRepository: Repository<Card>
  ) {}

  async upsertCard(payload: CreateCardInput): Promise<Card> {
    const existing = await this.cardsRepository.findOne({
      where: { sourceLink: payload.sourceLink }
    });

    if (existing != null) {
      const merged = this.cardsRepository.merge(existing, payload);
      return await this.cardsRepository.save(merged);
    }

    const created = this.cardsRepository.create(payload);
    return await this.cardsRepository.save(created);
  }

  async getFeed(cursor = 0, take = 10): Promise<FeedResponseDto> {
    const items = await this.cardsRepository
      .createQueryBuilder('card')
      .orderBy('RANDOM()')
      .skip(cursor)
      .take(take)
      .getMany();

    const nextCursor = items.length === take ? cursor + items.length : null;

    return { items, nextCursor };
  }
}
