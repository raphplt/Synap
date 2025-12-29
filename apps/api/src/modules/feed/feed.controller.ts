import {
	Body,
	Controller,
	DefaultValuePipe,
	Get,
	ParseIntPipe,
	Post,
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import { FeedService } from "./feed.service";
import { CardViewsService } from "../cards/card-views.service";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller()
export class FeedController {
	constructor (
		private readonly feedService: FeedService,
		private readonly cardViewsService: CardViewsService,
	) {}

	@Public()
	@Get("feed")
	async getFeed (
	@Request() req: { user?: { id: string } },
		@Query("cursor", new DefaultValuePipe(0), ParseIntPipe) cursor: number,
		@Query("take", new DefaultValuePipe(10), ParseIntPipe) take: number,
	) {
		// If user is authenticated, return personalized feed
		if (req.user?.id) {
			const items = await this.feedService.getPersonalizedFeed(req.user.id, take);
			return { items, nextCursor: null };
		}

		// Otherwise return anonymous feed
		return await this.feedService.getAnonymousFeed(cursor, take);
	}

	@UseGuards(JwtAuthGuard)
	@Get("feed/personalized")
	async getPersonalizedFeed (
	@Request() req: { user: { id: string } },
		@Query("take", new DefaultValuePipe(10), ParseIntPipe) take: number,
	) {
		const items = await this.feedService.getPersonalizedFeed(req.user.id, take);
		return { items, nextCursor: null };
	}

	@UseGuards(JwtAuthGuard)
	@Post("feed/mark-seen")
	async markCardAsSeen (
	@Request() req: { user: { id: string } },
		@Body() body: { cardId: string },
	) {
		const view = await this.cardViewsService.markAsSeen(req.user.id, body.cardId);
		return { success: true, viewCount: view.viewCount };
	}

	@UseGuards(JwtAuthGuard)
	@Post("feed/mark-seen-batch")
	async markCardsAsSeenBatch (
	@Request() req: { user: { id: string } },
		@Body() body: { cardIds: string[] },
	) {
		await this.cardViewsService.markMultipleAsSeen(req.user.id, body.cardIds);
		return { success: true, count: body.cardIds.length };
	}
}
