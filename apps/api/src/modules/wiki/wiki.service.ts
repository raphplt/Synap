import { Injectable, Logger } from "@nestjs/common";
import { CardsService } from "../cards/cards.service";
import { type Card } from "../cards/card.entity";

interface WikipediaApiResponse {
	title: string
	extract: string
	extract_html?: string
	content_urls: {
		desktop?: { page: string }
		mobile?: { page: string }
	}
	thumbnail?: {
		source: string
		width: number
		height: number
	}
	originalimage?: {
		source: string
		width: number
		height: number
	}
}

interface WikipediaRandomQueryResponse {
	query?: {
		random?: Array<{ id: number, ns: number, title: string }>
	}
}

interface WikipediaPageviewsResponse {
	items: Array<{
		project: string
		access: string
		year: string
		month: string
		day: string
		articles: Array<{
			article: string
			views: number
			rank: number
		}>
	}>
}

interface WikipediaFeedResponse {
	tfa?: {
		// Today's Featured Article
		type: string
		title: string
		extract: string
		originalimage?: { source: string, width: number, height: number }
		content_urls?: { desktop?: { page: string }, mobile?: { page: string } }
	}
	onthisday?: Array<{
		text: string
		pages: Array<{
			title: string
			extract: string
			originalimage?: { source: string, width: number, height: number }
			content_urls?: { desktop?: { page: string }, mobile?: { page: string } }
		}>
	}>
}

@Injectable()
export class WikiIngestService {
	private readonly logger = new Logger(WikiIngestService.name);
	private lastRequestAtMs = 0;

	constructor (private readonly cardsService: CardsService) {}

	private getUserAgent (): string {
		return process.env.WIKI_USER_AGENT ?? "MEMEX/0.1 (contact: dev@memex.local)";
	}

	private getMinDelayMs (): number {
		const value = Number(process.env.WIKI_MIN_DELAY_MS ?? 1100);
		return Number.isFinite(value) ? Math.max(0, value) : 1100;
	}

	private async throttle (): Promise<void> {
		const minDelay = this.getMinDelayMs();
		const now = Date.now();
		const wait = this.lastRequestAtMs + minDelay - now;
		if (wait > 0) {
			await new Promise((resolve) => setTimeout(resolve, wait));
		}
		this.lastRequestAtMs = Date.now();
	}

	private cleanText (text: string): string {
		return text
			.replace(/\[\d+\]/g, "") // remove references [1]
			.replace(/\{\{[^}]+\}\}/g, "") // remove templates
			.replace(/\s{2,}/g, " ")
			.trim();
	}

	private getYesterdayComponents (): {
		year: string
		month: string
		day: string
	} {
		const date = new Date();
		date.setDate(date.getDate() - 1);
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return { year, month, day };
	}

	private getTodayComponents (): { year: string, month: string, day: string } {
		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return { year, month, day };
	}

	private normalizeWikiTitle (title: string): string {
		return title.trim().replace(/\s+/g, " ");
	}

	private pickMediaUrl (payload: WikipediaApiResponse): string {
		const original = payload.originalimage;
		const thumb = payload.thumbnail;

		const chosen = original ?? thumb;
		if (chosen == null) {
			throw new Error("Image manquante.");
		}

		const width = chosen.width ?? 0;
		if (width < 500) {
			throw new Error("Image trop petite (<500px).");
		}

		return chosen.source;
	}

	async fetchSummary (title: string): Promise<WikipediaApiResponse> {
		await this.throttle();
		const encoded = encodeURIComponent(title);
		const response = await fetch(
			`https://fr.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
			{
				headers: {
					accept: "application/json",
					"user-agent": this.getUserAgent(),
				},
			},
		);

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Wiki API error (${response.status}): ${body}`);
		}

		return (await response.json()) as WikipediaApiResponse;
	}

	async fetchRandomTitles (count: number): Promise<string[]> {
		await this.throttle();
		const rnlimit = Math.min(50, Math.max(1, count));
		const url =
			"https://fr.wikipedia.org/w/api.php" +
			`?action=query&format=json&list=random&rnnamespace=0&rnlimit=${rnlimit}&origin=*`;

		const response = await fetch(url, {
			headers: {
				accept: "application/json",
				"user-agent": this.getUserAgent(),
			},
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Wiki random API error (${response.status}): ${body}`);
		}

		const payload = (await response.json()) as WikipediaRandomQueryResponse;
		const titles = payload.query?.random?.map((r) => r.title) ?? [];
		return titles.filter((t) => typeof t === "string" && t.length > 0);
	}

	async fetchTopPageviews (): Promise<Array<{ title: string, views: number }>> {
		await this.throttle();
		const { year, month, day } = this.getYesterdayComponents(); // Top pageviews are usually for yesterday

		const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia/all-access/${year}/${month}/${day}`;

		const response = await fetch(url, {
			headers: { "user-agent": this.getUserAgent() },
		});
		if (!response.ok) {
			if (response.status === 404) {
				this.logger.warn(
					`No top pageviews data available for ${year}-${month}-${day}`,
				);
				return [];
			}
			throw new Error(`Wiki pageviews API error (${response.status})`);
		}

		const data = (await response.json()) as WikipediaPageviewsResponse;
		if (!data.items?.[0]?.articles) return [];

		return data.items[0].articles.map((a) => ({
			title: a.article.replace(/_/g, " "),
			views: a.views,
		}));
	}

	async fetchFeatured (): Promise<
	Array<{
		title: string
		type: "WIKI_FEATURED" | "HISTORY"
		extract?: string
		image?: any
	}>
	> {
		await this.throttle();
		const { year, month, day } = this.getTodayComponents();
		const url = `https://api.wikimedia.org/feed/v1/wikipedia/fr/featured/${year}/${month}/${day}`;

		const response = await fetch(url, {
			headers: { "user-agent": this.getUserAgent() },
		});
		if (!response.ok) {
			throw new Error(`Wiki featured API error (${response.status})`);
		}

		const data = (await response.json()) as WikipediaFeedResponse;
		const results: Array<{
			title: string
			type: "WIKI_FEATURED" | "HISTORY"
			extract?: string
			image?: any
		}> = [];

		if (data.tfa) {
			results.push({
				title: data.tfa.title,
				type: "WIKI_FEATURED",
				extract: data.tfa.extract,
				image: data.tfa.originalimage,
			});
		}

		if (data.onthisday) {
			for (const group of data.onthisday) {
				for (const page of group.pages) {
					results.push({
						title: page.title,
						type: "HISTORY",
						extract: page.extract,
						image: page.originalimage,
					});
				}
			}
		}

		return results;
	}

	async ingestTitle (
		title: string,
		opts: { popularityScore?: number, sourceType?: string } = {},
	): Promise<Card> {
		const normalizedTitle = this.normalizeWikiTitle(title);
		const existing = await this.cardsService.findBySource(
			"wikipedia",
			normalizedTitle,
		);
		if (existing != null) {
			return existing;
		}

		const raw = await this.fetchSummary(normalizedTitle);

		const mediaUrl = this.pickMediaUrl(raw);
		const extract = this.cleanText(raw.extract ?? "");

		if (extract.length === 0) {
			throw new Error("Contenu insuffisant après nettoyage.");
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
			sourceAttribution: "Contenu Wikipédia – CC BY-SA 3.0",
			sourceType: opts.sourceType ?? "wikipedia",
			sourceId: normalizedTitle,
			popularityScore: opts.popularityScore ?? 0,
			userRating: 0,
		};

		const card = await this.cardsService.upsertCard(payload);
		this.logger.log(`Ingestion réussie: ${raw.title}`);
		return card;
	}

	async ingestTitles (titles: string[]): Promise<Card[]> {
		const results: Card[] = [];
		for (const title of titles) {
			try {
				const card = await this.ingestTitle(title, { sourceType: "WIKI_RANDOM" });
				results.push(card);
			} catch (error) {
				this.logger.warn(`Ingestion ignorée pour "${title}": ${String(error)}`);
			}
		}
		return results;
	}

	async ingestTopPageviews (limit = 100): Promise<Card[]> {
		const articles = await this.fetchTopPageviews();
		const selection = articles.slice(0, limit);
		const results: Card[] = [];

		for (const item of selection) {
			try {
				const card = await this.ingestTitle(item.title, {
					popularityScore: item.views,
					sourceType: "WIKI_TOP",
				});
				results.push(card);
			} catch (e) {
				this.logger.warn(`Ingestion top failed for ${item.title}: ${String(e)}`);
			}
		}
		return results;
	}

	async ingestFeatured (): Promise<Card[]> {
		const items = await this.fetchFeatured();
		const results: Card[] = [];
		for (const item of items) {
			try {
				const card = await this.ingestTitle(item.title, {
					popularityScore: 1000000,
					sourceType: item.type,
				});
				results.push(card);
			} catch (e) {
				this.logger.warn(
					`Ingestion featured failed for ${item.title}: ${String(e)}`,
				);
			}
		}
		return results;
	}

	async ingestRandom (count: number): Promise<Card[]> {
		const titles = await this.fetchRandomTitles(count);
		return await this.ingestTitles(titles);
	}
}
