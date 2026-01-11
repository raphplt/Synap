import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Deck } from "../decks/deck.entity";

export type CardOrigin = "WIKIPEDIA" | "CURATED" | "AI_GENERATED";

@Entity({ name: "cards" })
@Index(["sourceLink"], { unique: true })
@Index(["sourceType", "sourceId"], { unique: true })
export class Card {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 255 })
	title!: string;

	@Column({ type: "text" })
	summary!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({ type: "text" })
	mediaUrl!: string;

	@Column({ type: "text" })
	sourceLink!: string;

	@Column({ type: "varchar", length: 255, nullable: true })
	sourceAttribution?: string | null;

	@Column({ type: "varchar", length: 64, nullable: true })
	sourceType?: string | null;

	@Column({ type: "int", default: 0 })
	popularityScore!: number;

	@Column({ type: "int", default: 0 })
	userRating!: number;

	@Column({ type: "varchar", length: 255, nullable: true })
	sourceId?: string | null;

	@Column({ type: "varchar", length: 32, default: "WIKIPEDIA" })
	origin!: CardOrigin;

	@Column({ type: "varchar", length: 255, nullable: true })
	externalId?: string | null;

	@Column({ type: "int", default: 50 })
	qualityScore!: number;

	@Column({ type: "uuid", nullable: true })
	deckId?: string | null;

	@ManyToOne(() => Deck, (deck) => deck.cards, { nullable: true })
	@JoinColumn({ name: "deckId" })
	deck?: Deck | null;

	@Column({ type: "jsonb", nullable: true })
	quizAnswers?: string[] | null;

	@Column({ type: "int", nullable: true })
	quizCorrectIndex?: number | null;

	@Column({ type: "int", default: 0 })
	sortOrder!: number;

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedAt!: Date;
}
