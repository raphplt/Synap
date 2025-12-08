import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { ICard } from "@memex/shared";

@Entity("cards")
export class Card implements ICard {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column()
	title!: string;

	@Column()
	summary!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({
		type: "enum",
		enum: ["LEARN", "QUIZ"],
		default: "LEARN",
	})
	type!: "LEARN" | "QUIZ";

	@Column()
	category!: string;

	@Column({ type: "int" })
	difficultyLevel!: number;

	@Column()
	mediaUrl!: string;

	@Column({ nullable: true })
	sourceLink!: string;

	@Column("simple-array")
	tags!: string[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
