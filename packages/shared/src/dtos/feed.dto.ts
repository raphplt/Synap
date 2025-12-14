import { CardBase } from '../types/card';

export interface FeedResponseDto {
  items: CardBase[];
  nextCursor: number | null;
}
