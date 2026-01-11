import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import * as fs from "fs";
import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import { Card, type CardOrigin } from "../cards/card.entity";
import { Deck } from "../decks/deck.entity";
import { Category } from "../decks/category.entity";
import { User } from "../users/user.entity";

@Injectable()
export class SeedService {
	private readonly logger = new Logger(SeedService.name);

	constructor(
		@InjectRepository(Card)
		private readonly cardRepository: Repository<Card>,
		@InjectRepository(Deck)
		private readonly deckRepository: Repository<Deck>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	/**
	 * Create an admin user if it doesn't exist
	 * Default credentials: admin@synap.app / admin123
	 */
	async seedAdminUser(): Promise<{ created: boolean; email: string }> {
		const adminEmail = "admin@synap.app";
		const adminPassword = "admin123";
		const adminUsername = "admin";

		const existing = await this.userRepository.findOne({
			where: { email: adminEmail },
		});

		if (existing) {
			this.logger.log(`Admin user already exists: ${adminEmail}`);
			return { created: false, email: adminEmail };
		}

		const passwordHash = await argon2.hash(adminPassword);

		const admin = this.userRepository.create({
			email: adminEmail,
			username: adminUsername,
			passwordHash,
			xp: 0,
			streak: 0,
			interests: ["admin"],
		});

		await this.userRepository.save(admin);
		this.logger.log(`Created admin user: ${adminEmail} (password: ${adminPassword})`);

		return { created: true, email: adminEmail };
	}

	/**
	 * Import the Atlas v1.0 structure AND cards from JSON files
	 */
	/**
	 * Import the Atlas v1.0 structure AND cards from JSON files
	 * Scans the filesystem for all .json files in common/data/cards/{category}
	 */
	async seedAtlasFull(): Promise<{
		categories: number;
		decks: number;
		cards: number;
	}> {
		const atlasPath = path.join(process.cwd(), "src", "common", "data", "atlas-v1.json");
		const atlasData = JSON.parse(fs.readFileSync(atlasPath, "utf-8")) as {
			categories: Array<{
				name: string;
				slug: string;
				description: string;
				imageUrl: string;
			}>;
		};

		let totalCategories = 0;
		let totalDecks = 0;
		let totalCards = 0;

		const cardsBasePath = path.join(process.cwd(), "src", "common", "data", "cards");

		for (const catData of atlasData.categories) {
			// 1. Create or find category
			let category = await this.categoryRepository.findOne({
				where: { slug: catData.slug },
			});

			if (!category) {
				category = this.categoryRepository.create({
					name: catData.name,
					slug: catData.slug,
					description: catData.description,
					imageUrl: catData.imageUrl,
					sortOrder: totalCategories,
				});
				await this.categoryRepository.save(category);
				totalCategories++;
				this.logger.log(`Created category: ${category.name}`);
			}

			// 2. Scan directory for this category
			const categoryPath = path.join(cardsBasePath, catData.slug);
			if (!fs.existsSync(categoryPath)) {
				this.logger.warn(`Directory not found for category ${catData.slug}`);
				continue;
			}

			const deckFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith(".json"));

			for (const file of deckFiles) {
				const deckFilePath = path.join(categoryPath, file);

				try {
					const fileContent = fs.readFileSync(deckFilePath, "utf-8");
					const deckJson = JSON.parse(fileContent);

					// Helper to extract deck info, supporting both root-level props (legacy?) or "deck" object
					// Based on "architecture.json" viewed earlier, it has a "deck" object.
					const deckMeta = deckJson.deck || deckJson;

					// If no slug provided in file, fallback to filename without extension
					const deckSlug = deckMeta.slug || file.replace(".json", "");
					const deckName = deckMeta.name || deckSlug; // Fallback name

					// Create or find deck
					let deck = await this.deckRepository.findOne({
						where: { slug: deckSlug },
					});

					if (!deck) {
						deck = this.deckRepository.create({
							name: deckName,
							slug: deckSlug,
							description: deckMeta.description || "",
							imageUrl: deckMeta.imageUrl || catData.imageUrl, // Fallback to category image
							categoryId: category.id,
							cardCount: 0,
							sortOrder: totalDecks,
							isActive: true,
						});
						await this.deckRepository.save(deck);
						totalDecks++;
						this.logger.log(`Created deck: ${deck.name} from ${file}`);
					}

					// Import Cards
					// The structure in the file viewed was { deck: {...}, cards: [...] }
					// But we should support the array being valid
					const cardsList = deckJson.cards || (Array.isArray(deckJson) ? deckJson : []);

					if (Array.isArray(cardsList)) {
						let cardIndex = 0;
						for (const cardData of cardsList) {
							const externalId = `atlas-${deckSlug}-${cardIndex}`;

							// Find by externalId OR sourceLink to avoid duplicates
							// We check sourceLink only if it's present in the data
							// We check sourceLink only if it's present in the data
							const checkQuery: Array<{ externalId: string } | { sourceLink: string }> = [
								{ externalId },
							];
							if (cardData.sourceLink) {
								checkQuery.push({ sourceLink: cardData.sourceLink });
							}

							const existingCard = await this.cardRepository.findOne({
								where: checkQuery,
							});

							if (!existingCard) {
								const card = this.cardRepository.create({
									title: cardData.title,
									summary: cardData.summary,
									content: cardData.content,
									mediaUrl: cardData.mediaUrl ?? "",
									sourceLink: cardData.sourceLink ?? `synap://atlas/${deckSlug}/${cardIndex}`,
									sourceAttribution: cardData.sourceAttribution,
									sourceType: "CURATED",
									sourceId: externalId,
									origin: "CURATED" as CardOrigin,
									externalId,
									qualityScore: 90,
									deckId: deck.id,
									quizAnswers: cardData.quizAnswers,
									quizCorrectIndex: cardData.quizCorrectIndex,
									sortOrder: cardIndex,
								});
								await this.cardRepository.save(card);
								totalCards++;
							}
							cardIndex++;
						}
					}

					// Update card count
					const cardCount = await this.cardRepository.count({
						where: { deckId: deck.id },
					});
					await this.deckRepository.update(deck.id, { cardCount });
				} catch (err) {
					this.logger.error(
						`Failed to process file ${file} for category ${catData.slug}: ${String(err)}`,
					);
				}
			}
		}

		this.logger.log(
			`Atlas Full seeding complete: ${totalCategories} categories, ${totalDecks} decks, ${totalCards} cards`,
		);
		return { categories: totalCategories, decks: totalDecks, cards: totalCards };
	}

	/**
	 * Run all seeders
	 */
	async seedAll(): Promise<{
		admin: boolean;
		atlas: { categories: number; decks: number; cards: number };
	}> {
		this.logger.log("Starting full seed...");

		const adminResult = await this.seedAdminUser();
		const atlasResult = await this.seedAtlasFull();

		this.logger.log("Full seed completed successfully");

		return {
			admin: adminResult.created,
			atlas: atlasResult,
		};
	}
}
