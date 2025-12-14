import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { WikiIngestService } from './wiki.service';

class IngestRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title!: string;
}

class IngestBatchRequestDto {
  @IsArray()
  @IsString({ each: true })
  titles!: string[];
}

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiIngestService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  async ingestOne(@Body() body: IngestRequestDto) {
    return await this.wikiService.ingestTitle(body.title);
  }

  @Post('ingest/batch')
  @HttpCode(HttpStatus.CREATED)
  async ingestBatch(@Body() body: IngestBatchRequestDto) {
    return await this.wikiService.ingestTitles(body.titles);
  }
}
