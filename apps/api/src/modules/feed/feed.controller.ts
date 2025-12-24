import {
	Controller,
	DefaultValuePipe,
	Get,
	ParseIntPipe,
	Query,
} from "@nestjs/common";
import { FeedService } from "./feed.service";
import { Public } from "../auth/decorators/public.decorator";

@Controller()
export class FeedController {
	constructor(private readonly feedService: FeedService) {}

	@Public()
	@Get("feed")
	async getFeed(
		@Query("cursor", new DefaultValuePipe(0), ParseIntPipe) cursor: number,
		@Query("take", new DefaultValuePipe(10), ParseIntPipe) take: number
	) {
		return await this.feedService.getFeed(cursor, take);
	}
}
