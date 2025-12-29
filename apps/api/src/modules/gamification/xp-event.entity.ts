import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";

export type XpEventType =
	| "CARD_VIEW"
	| "CARD_RETAINED"
	| "CARD_FORGOT"
	| "CARD_GOLD"
	| "DECK_COMPLETE"
	| "QUIZ_SUCCESS"
	| "STREAK_7"
	| "STREAK_30"
	| "STREAK_BONUS";

@Entity({ name: "xp_events" })
@Index(["userId", "createdAt"])
export class XpEvent {
	@PrimaryGeneratedColumn("uuid")
		id!: string;

	@Column({ type: "uuid" })
		userId!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
		user!: User;

	@Column({ type: "int" })
		amount!: number;

	@Column({ type: "varchar", length: 32 })
		reason!: XpEventType;

	@Column({ type: "jsonb", nullable: true })
		metadata?: {
		cardId?: string
		deckId?: string
		categoryId?: string
		streakDay?: number
	} | null;

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date;
}
