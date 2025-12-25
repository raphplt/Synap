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
import { User } from "../users/user.entity";
import { Category } from "../decks/category.entity";

@Entity({ name: "user_category_progress" })
@Index(["userId", "categoryId"], { unique: true })
export class UserCategoryProgress {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	userId!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User;

	@Column({ type: "uuid" })
	categoryId!: string;

	@ManyToOne(() => Category, { onDelete: "CASCADE" })
	@JoinColumn({ name: "categoryId" })
	category!: Category;

	@Column({ type: "int", default: 0 })
	xp!: number;

	@Column({ type: "int", default: 1 })
	level!: number;

	@Column({ type: "int", default: 0 })
	cardsCompleted!: number;

	@Column({ type: "int", default: 0 })
	cardsGold!: number;

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedAt!: Date;
}
