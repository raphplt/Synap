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

interface CuratedCard {
	title: string
	summary: string
	content: string
	mediaUrl?: string
}

interface CuratedDeck {
	name: string
	slug: string
	description: string
	imageUrl: string
	cards: CuratedCard[]
}

interface CuratedCategory {
	name: string
	slug: string
	description: string
	imageUrl: string
	decks: CuratedDeck[]
}

@Injectable()
export class SeedService {
	private readonly logger = new Logger(SeedService.name);

	constructor (
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
	async seedAdminUser (): Promise<{ created: boolean, email: string }> {
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
		this.logger.log(
			`Created admin user: ${adminEmail} (password: ${adminPassword})`,
		);

		return { created: true, email: adminEmail };
	}

	/**
	 * Import the Atlas v1.0 structure (20 categories, 200 decks)
	 */
	async seedAtlas (): Promise<{ categories: number, decks: number }> {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const atlasData = require("../../common/data/atlas-v1.json");

		let totalCategories = 0;
		let totalDecks = 0;

		for (const catData of atlasData.categories) {
			// Create or find category
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

			// Create decks
			for (const deckData of catData.decks) {
				const existingDeck = await this.deckRepository.findOne({
					where: { slug: deckData.slug },
				});

				if (!existingDeck) {
					const deck = this.deckRepository.create({
						name: deckData.name,
						slug: deckData.slug,
						description: deckData.description,
						imageUrl: catData.imageUrl, // Use category emoji as placeholder
						categoryId: category.id,
						cardCount: 0,
						sortOrder: totalDecks,
						isActive: true,
					});
					await this.deckRepository.save(deck);
					totalDecks++;
				}
			}
		}

		this.logger.log(
			`Atlas seeding complete: ${totalCategories} categories, ${totalDecks} decks`,
		);
		return { categories: totalCategories, decks: totalDecks };
	}

	/**
	 * Import the Atlas v1.0 structure AND cards from JSON files
	 */
	async seedAtlasFull (): Promise<{
		categories: number
		decks: number
		cards: number
	}> {
		const atlasPath = path.join(
			process.cwd(),
			"src",
			"common",
			"data",
			"atlas-v1.json",
		);
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const atlasData = require(atlasPath);

		let totalCategories = 0;
		let totalDecks = 0;
		let totalCards = 0;

		const cardsBasePath = path.join(
			process.cwd(),
			"src",
			"common",
			"data",
			"cards",
		);

		for (const catData of atlasData.categories) {
			// Create or find category
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

			// Create decks
			for (const deckData of catData.decks) {
				let deck = await this.deckRepository.findOne({
					where: { slug: deckData.slug },
				});

				if (!deck) {
					deck = this.deckRepository.create({
						name: deckData.name,
						slug: deckData.slug,
						description: deckData.description,
						imageUrl: catData.imageUrl, // Use category emoji as placeholder if no image
						categoryId: category.id,
						cardCount: 0,
						sortOrder: totalDecks,
						isActive: true,
					});
					await this.deckRepository.save(deck);
					totalDecks++;
					this.logger.log(`Created deck: ${deck.name}`);
				}

				// Import Cards
				const deckFilePath = path.join(
					cardsBasePath,
					catData.slug,
					`${deckData.slug}.json`,
				);

				if (fs.existsSync(deckFilePath)) {
					try {
						const deckContent = JSON.parse(fs.readFileSync(deckFilePath, "utf-8"));

						if (
							deckContent?.cards &&
							Array.isArray(deckContent.cards)
						) {
							let cardIndex = 0;
							for (const cardData of deckContent.cards) {
								const externalId = `atlas-${deck.slug}-${cardIndex}`;

								// Find by externalId OR sourceLink to avoid duplicates
								const existingCard = await this.cardRepository.findOne({
									where: [{ externalId }, { sourceLink: cardData.sourceLink }],
								});

								if (!existingCard) {
									const card = this.cardRepository.create({
										title: cardData.title,
										summary: cardData.summary,
										content: cardData.content,
										mediaUrl: cardData.mediaUrl ?? "",
										sourceLink:
											cardData.sourceLink ?? `synap://atlas/${deck.slug}/${cardIndex}`,
										sourceAttribution: cardData.sourceAttribution,
										sourceType: "CURATED",
										sourceId: externalId,
										origin: "CURATED" as CardOrigin,
										externalId,
										qualityScore: 90,
										deckId: deck.id,
										quizAnswers: cardData.quizAnswers,
										quizCorrectIndex: cardData.quizCorrectIndex,
									});
									await this.cardRepository.save(card);
									totalCards++;
								}
								cardIndex++;
							}
						}
					} catch (err) {
						this.logger.error(`Failed to parse cards for deck ${deck.slug}: ${err}`);
					}
				}

				// Update card count
				const cardCount = await this.cardRepository.count({
					where: { deckId: deck.id },
				});
				await this.deckRepository.update(deck.id, { cardCount });
			}
		}

		this.logger.log(
			`Atlas Full seeding complete: ${totalCategories} categories, ${totalDecks} decks, ${totalCards} cards`,
		);
		return { categories: totalCategories, decks: totalDecks, cards: totalCards };
	}

	async seedGoldDataset (): Promise<{
		categories: number
		decks: number
		cards: number
	}> {
		const data = this.getGoldDataset();

		let totalCategories = 0;
		let totalDecks = 0;
		let totalCards = 0;

		for (const categoryData of data) {
			// Create or find category
			let category = await this.categoryRepository.findOne({
				where: { slug: categoryData.slug },
			});

			if (!category) {
				category = this.categoryRepository.create({
					name: categoryData.name,
					slug: categoryData.slug,
					description: categoryData.description,
					imageUrl: categoryData.imageUrl,
					sortOrder: totalCategories,
				});
				await this.categoryRepository.save(category);
				totalCategories++;
				this.logger.log(`Created category: ${category.name}`);
			}

			for (const deckData of categoryData.decks) {
				// Create or find deck
				let deck = await this.deckRepository.findOne({
					where: { slug: deckData.slug },
				});

				if (!deck) {
					deck = this.deckRepository.create({
						name: deckData.name,
						slug: deckData.slug,
						description: deckData.description,
						imageUrl: deckData.imageUrl,
						categoryId: category.id,
						cardCount: deckData.cards.length,
						sortOrder: totalDecks,
						isActive: true,
					});
					await this.deckRepository.save(deck);
					totalDecks++;
					this.logger.log(`Created deck: ${deck.name}`);
				}

				// Create cards
				let cardIndex = 0;
				for (const cardData of deckData.cards) {
					const externalId = `curated-${deck.slug}-${cardIndex}`;
					const existingCard = await this.cardRepository.findOne({
						where: { externalId },
					});

					if (!existingCard) {
						const card = this.cardRepository.create({
							title: cardData.title,
							summary: cardData.summary,
							content: cardData.content,
							mediaUrl: cardData.mediaUrl ?? "",
							sourceLink: `synap://curated/${deck.slug}/${cardIndex}`,
							sourceType: "CURATED",
							sourceId: externalId,
							origin: "CURATED" as CardOrigin,
							externalId,
							qualityScore: 90,
							deckId: deck.id,
						});
						await this.cardRepository.save(card);
						totalCards++;
					}
					cardIndex++;
				}

				// Update deck card count
				const cardCount = await this.cardRepository.count({
					where: { deckId: deck.id },
				});
				await this.deckRepository.update(deck.id, { cardCount });
			}
		}

		this.logger.log(
			`Seeding complete: ${totalCategories} categories, ${totalDecks} decks, ${totalCards} cards`,
		);
		return { categories: totalCategories, decks: totalDecks, cards: totalCards };
	}

	private getGoldDataset (): CuratedCategory[] {
		return [
			{
				name: "Psychologie",
				slug: "psychologie",
				description: "Comprendre l'esprit humain",
				imageUrl:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
				decks: [
					{
						name: "Biais Cognitifs",
						slug: "biais-cognitifs",
						description: "Les 25 biais qui influencent nos décisions",
						imageUrl:
							"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
						cards: [
							{
								title: "Biais de confirmation",
								summary:
									"Tendance à rechercher des informations qui confirment nos croyances",
								content:
									"Le biais de confirmation est la tendance à favoriser les informations qui confirment nos hypothèses préexistantes. Nous interprétons les données ambiguës de manière à soutenir nos croyances et négligeons les preuves contradictoires. Ce biais affecte notre prise de décision quotidienne, des choix politiques aux décisions professionnelles.",
							},
							{
								title: "Effet Dunning-Kruger",
								summary: "Les incompétents surestiment leurs capacités",
								content:
									"L'effet Dunning-Kruger est un biais cognitif où les personnes peu qualifiées dans un domaine surestiment leur compétence, tandis que les experts sous-estiment la leur. Plus on en sait, plus on réalise l'étendue de ce qu'on ignore. Les débutants manquent de métacognition pour reconnaître leurs erreurs.",
							},
							{
								title: "Biais d'ancrage",
								summary: "La première information influence toutes les suivantes",
								content:
									"L'ancrage est la tendance à s'appuyer excessivement sur la première information reçue (l'ancre) pour prendre des décisions. Dans une négociation, celui qui propose le premier prix influence fortement le résultat final. Ce biais est exploité en marketing avec les prix barrés.",
							},
							{
								title: "Aversion à la perte",
								summary: "Perdre fait plus mal que gagner fait plaisir",
								content:
									"L'aversion à la perte décrit le fait que la douleur de perdre quelque chose est psychologiquement environ deux fois plus puissante que le plaisir de gagner la même chose. C'est pourquoi nous évitons les risques même quand les gains potentiels sont supérieurs aux pertes.",
							},
							{
								title: "Biais de disponibilité",
								summary: "Ce qui vient facilement à l'esprit semble plus fréquent",
								content:
									"Le biais de disponibilité nous fait surestimer la probabilité d'événements qui sont faciles à se remémorer. Les accidents d'avion semblent plus fréquents que les accidents de voiture car ils sont plus médiatisés, bien que statistiquement l'avion soit beaucoup plus sûr.",
							},
							{
								title: "Effet de halo",
								summary: "Un trait positif influence notre perception globale",
								content:
									"L'effet de halo est la tendance à laisser une impression positive (ou négative) dans un domaine influencer notre jugement dans d'autres domaines. Une personne physiquement attirante sera perçue comme plus intelligente, compétente et honnête, même sans preuve.",
							},
							{
								title: "Biais du survivant",
								summary: "On ne voit que les succès, pas les échecs",
								content:
									"Le biais du survivant nous fait nous concentrer sur les personnes ou choses qui ont réussi tout en négligeant celles qui ont échoué. On étudie les entrepreneurs à succès sans considérer les milliers qui ont échoué avec les mêmes méthodes.",
							},
							{
								title: "Effet de récence",
								summary: "Les dernières informations pèsent plus lourd",
								content:
									"L'effet de récence est la tendance à accorder plus de poids aux informations les plus récentes. Dans un entretien, ce qui est dit en dernier est mieux retenu. C'est pourquoi il est stratégique de terminer sur une note positive.",
							},
						],
					},
				],
			},
			{
				name: "Histoire",
				slug: "histoire",
				description: "Les moments clés de l'humanité",
				imageUrl:
					"https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400",
				decks: [
					{
						name: "Révolutions Scientifiques",
						slug: "revolutions-scientifiques",
						description: "Les découvertes qui ont changé notre vision du monde",
						imageUrl:
							"https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400",
						cards: [
							{
								title: "Révolution copernicienne",
								summary: "La Terre n'est pas le centre de l'univers",
								content:
									"En 1543, Nicolas Copernic publie De revolutionibus proposant un modèle héliocentrique où la Terre tourne autour du Soleil. Cette révolution scientifique a bouleversé notre place dans l'univers et déclenché une transformation profonde de la pensée occidentale.",
							},
							{
								title: "Théorie de l'évolution",
								summary: "Les espèces évoluent par sélection naturelle",
								content:
									"Charles Darwin publie L'Origine des espèces en 1859, expliquant comment les espèces évoluent par sélection naturelle. Les individus les mieux adaptés survivent et transmettent leurs traits. Cette théorie unifie toute la biologie et explique la diversité du vivant.",
							},
							{
								title: "Relativité générale",
								summary: "L'espace-temps est courbé par la masse",
								content:
									"En 1915, Einstein révolutionne notre compréhension de la gravité. La masse courbe l'espace-temps lui-même, et les objets suivent ces courbures. Le temps ralentit près des masses importantes. GPS, trous noirs, ondes gravitationnelles : les applications sont immenses.",
							},
							{
								title: "Mécanique quantique",
								summary: "L'univers est probabiliste à l'échelle subatomique",
								content:
									"Au début du XXe siècle, les physiciens découvrent que les particules se comportent comme des ondes de probabilité. Un électron n'a pas de position définie avant d'être mesuré. Cette révolution a permis les lasers, transistors, et ordinateurs.",
							},
							{
								title: "Structure de l'ADN",
								summary: "Le code génétique est une double hélice",
								content:
									"En 1953, Watson et Crick découvrent la structure en double hélice de l'ADN. Cette découverte explique comment l'information génétique est stockée et transmise. Elle a ouvert la voie au génie génétique, au séquençage, et à la médecine personnalisée.",
							},
						],
					},
				],
			},
			{
				name: "Sciences",
				slug: "sciences",
				description: "Comprendre le monde qui nous entoure",
				imageUrl:
					"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
				decks: [
					{
						name: "Physique Quantique 101",
						slug: "physique-quantique-101",
						description: "Les bases de la mécanique quantique expliquées simplement",
						imageUrl:
							"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
						cards: [
							{
								title: "Dualité onde-particule",
								summary: "La lumière est à la fois onde et particule",
								content:
									"La physique quantique révèle que les particules comme les photons se comportent parfois comme des ondes, parfois comme des particules. L'expérience des fentes de Young montre cette dualité : un photon passe par les deux fentes simultanément comme une onde, mais frappe l'écran en un point précis comme une particule.",
							},
							{
								title: "Principe d'incertitude",
								summary: "On ne peut pas tout mesurer précisément",
								content:
									"Heisenberg a montré qu'il est impossible de connaître simultanément la position et la vitesse exactes d'une particule. Plus on mesure précisément l'une, moins on peut connaître l'autre. Ce n'est pas une limite technique mais une propriété fondamentale de la nature.",
							},
							{
								title: "Intrication quantique",
								summary: "Deux particules liées instantanément à distance",
								content:
									"Deux particules intriquées restent connectées peu importe la distance. Mesurer l'une affecte instantanément l'autre, même à des années-lumière. Einstein appelait cela action fantomatique à distance. C'est le principe derrière les futurs ordinateurs quantiques.",
							},
							{
								title: "Superposition quantique",
								summary: "Une particule peut être dans plusieurs états simultanément",
								content:
									"Avant d'être mesurée, une particule quantique existe dans tous ses états possibles en même temps. Le célèbre chat de Schrödinger illustre ce concept : le chat est à la fois mort ET vivant jusqu'à ce qu'on ouvre la boîte.",
							},
							{
								title: "Effet tunnel",
								summary: "Les particules traversent les barrières impossibles",
								content:
									"En mécanique quantique, une particule peut traverser une barrière qu'elle ne devrait pas pouvoir franchir classiquement. C'est comme si une balle passait à travers un mur. Cet effet permet la fusion nucléaire dans les étoiles et les mémoires flash.",
							},
						],
					},
				],
			},
			{
				name: "Philosophie",
				slug: "philosophie",
				description: "Les grandes questions de l'existence",
				imageUrl:
					"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
				decks: [
					{
						name: "Expériences de pensée",
						slug: "experiences-pensee",
						description: "Des scénarios qui défient notre intuition morale",
						imageUrl:
							"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
						cards: [
							{
								title: "Le dilemme du tramway",
								summary: "Tuer un pour en sauver cinq ?",
								content:
									"Un tramway fou va écraser 5 personnes. Vous pouvez actionner un levier pour le dévier sur une voie où il n'y a qu'une personne. Devez-vous activement tuer une personne pour en sauver cinq ? Ce dilemme oppose l'utilitarisme (maximiser le bien) à la déontologie (ne pas tuer activement).",
							},
							{
								title: "La chambre chinoise",
								summary: "Comprendre vraiment vs simuler la compréhension",
								content:
									"Searle imagine une personne dans une pièce qui manipule des symboles chinois selon des règles, sans comprendre le chinois. Peut-elle comprendre ? Cette expérience remet en question si les IA peuvent vraiment comprendre ou si elles ne font que simuler.",
							},
							{
								title: "Le cerveau dans une cuve",
								summary: "Comment savoir si notre réalité est réelle ?",
								content:
									"Imaginez que votre cerveau flotte dans une cuve, stimulé par un ordinateur. Toutes vos expériences seraient des simulations. Pourriez-vous le savoir ? Cette expérience, reprise dans Matrix, questionne la nature de la réalité et de la connaissance.",
							},
							{
								title: "Le voile d'ignorance",
								summary: "Concevoir une société juste sans connaître sa place",
								content:
									"Rawls propose de concevoir les règles d'une société derrière un voile d'ignorance : sans savoir si on sera riche ou pauvre, valide ou handicapé. On créerait alors une société plus juste car on voudrait que la pire position soit acceptable.",
							},
							{
								title: "Le bateau de Thésée",
								summary: "Reste-t-on le même après un remplacement complet ?",
								content:
									"Si on remplace progressivement toutes les planches d'un bateau, est-ce toujours le même bateau ? Et si on reconstruit l'original avec les vieilles planches ? Cette question sur l'identité s'applique à nous : nos cellules se renouvellent, sommes-nous les mêmes ?",
							},
						],
					},
				],
			},
		];
	}
}
