import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('feed')
  async getFeed(
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number
  ) {
    return await this.cardsService.getFeed(cursor);
  }
}
