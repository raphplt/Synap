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
import { Card } from "./card.entity";

export type BookmarkType = "LIKE" | "BOOKMARK";

@Entity({ name: "user_card_bookmarks" })
@Index(["userId", "cardId", "type"], { unique: true })
export class UserCardBookmark {
	@PrimaryGeneratedColumn("uuid")
		id!: string;

	@Column({ type: "uuid" })
		userId!: string;

	@Column({ type: "uuid" })
		cardId!: string;

	@Column({ type: "varchar", length: 20, default: "BOOKMARK" })
		type!: BookmarkType;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
		user!: User;

	@ManyToOne(() => Card, { onDelete: "CASCADE" })
	@JoinColumn({ name: "cardId" })
		card!: Card;

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date;
}
