import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "../app.module"
import { FeedService } from "../modules/feed/feed.service"

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule, {
		logger: ["error", "warn"], // Reduce logs
	})

	try {
		const feedService = app.get(FeedService)
		console.log("Fetching anonymous feed (take=20)...")

		const result = await feedService.getAnonymousFeed(0, 20)

		console.log(`Received ${result.items.length} items`)
		console.log("\nDeck Sequence:")

		const deckSequence = result.items.map((i) => i.deckId ?? "NULL")

		// Print deck IDs to visualize interleaving
		result.items.forEach((item, index) => {
			console.log(
				`#${index + 1}: ${
					item.deck?.name ?? item.deckId
				} (Date: ${item.createdAt.toISOString()})`
			)
		})

		// Basic automated check
		const uniqueDecksFirst5 = new Set(deckSequence.slice(0, 5))
		console.log(`\nUnique decks in first 5 items: ${uniqueDecksFirst5.size}`)

		if (result.items.length > 5 && uniqueDecksFirst5.size < 2) {
			console.warn(
				"WARNING: First 5 items seem to be from the same deck (or very few decks). Randomization might be failing."
			)
		} else {
			console.log("SUCCESS: Decks appear to be mixed.")
		}
	} catch (error) {
		console.error("Verification failed:", error)
		process.exit(1)
	} finally {
		await app.close()
	}
}

bootstrap().catch((error) => {
	console.error("Unexpected error:", error)
	process.exit(1)
})
