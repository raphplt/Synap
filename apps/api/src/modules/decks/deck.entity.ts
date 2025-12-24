import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { Category } from "./category.entity"
import { Card } from "../cards/card.entity"

@Entity({ name: "decks" })
@Index(["slug"], { unique: true })
export class Deck {
	@PrimaryGeneratedColumn("uuid")
		id!: string

	@Column({ type: "varchar", length: 100 })
		name!: string

	@Column({ type: "varchar", length: 100 })
		slug!: string

	@Column({ type: "text" })
		description!: string

	@Column({ type: "varchar", length: 500 })
		imageUrl!: string

	@Column({ type: "uuid", nullable: true })
		categoryId?: string | null

	@ManyToOne(() => Category, { nullable: true })
	@JoinColumn({ name: "categoryId" })
		category?: Category | null

	@Column({ type: "int", default: 0 })
		cardCount!: number

	@Column({ type: "int", default: 0 })
		sortOrder!: number

	@Column({ type: "boolean", default: true })
		isActive!: boolean

	@OneToMany(() => Card, (card) => card.deck)
		cards?: Card[]

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date

	@UpdateDateColumn({ type: "timestamp with time zone" })
		updatedAt!: Date
}
