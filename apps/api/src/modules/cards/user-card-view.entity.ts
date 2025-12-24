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
import { Card } from "./card.entity"

@Entity({ name: "user_card_views" })
@Index(["userId", "cardId"], { unique: true })
export class UserCardView {
	@PrimaryGeneratedColumn("uuid")
	id!: string

	@Column({ type: "uuid" })
	userId!: string

	@Column({ type: "uuid" })
	cardId!: string

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User

	@ManyToOne(() => Card, { onDelete: "CASCADE" })
	@JoinColumn({ name: "cardId" })
	card!: Card

	@Column({ type: "int", default: 1 })
	viewCount!: number

	@CreateDateColumn({ type: "timestamp with time zone" })
	firstSeenAt!: Date

	@UpdateDateColumn({ type: "timestamp with time zone" })
	lastSeenAt!: Date
}
