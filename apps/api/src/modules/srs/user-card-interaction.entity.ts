import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { User } from "../users/user.entity"
import { Card } from "../cards/card.entity"

export type CardStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | "GOLD"

@Entity({ name: "user_card_interactions" })
@Index(["userId", "cardId"], { unique: true })
@Index(["userId", "nextReviewDate"])
@Index(["userId", "status"])
export class UserCardInteraction {
	@PrimaryGeneratedColumn("uuid")
		id!: string

	@Column({ type: "uuid" })
		userId!: string

	@ManyToOne(() => User)
	@JoinColumn({ name: "userId" })
		user?: User

	@Column({ type: "uuid" })
		cardId!: string

	@ManyToOne(() => Card)
	@JoinColumn({ name: "cardId" })
		card?: Card

	@Column({ type: "varchar", length: 20, default: "NEW" })
		status!: CardStatus

	// SM-2 algorithm fields
	@Column({ type: "decimal", precision: 4, scale: 2, default: 2.5 })
		easeFactor!: number

	@Column({ type: "int", default: 0 })
		interval!: number // in days

	@Column({ type: "int", default: 0 })
		repetitions!: number

	@Column({ type: "int", default: 0 })
		consecutiveSuccesses!: number

	@Column({ type: "timestamp with time zone", nullable: true })
		nextReviewDate?: Date | null

	@Column({ type: "timestamp with time zone", nullable: true })
		lastReviewedAt?: Date | null

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date

	@UpdateDateColumn({ type: "timestamp with time zone" })
		updatedAt!: Date
}
