import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "categories" })
@Index(["slug"], { unique: true })
export class Category {
	@PrimaryGeneratedColumn("uuid")
		id!: string;

	@Column({ type: "varchar", length: 100 })
		name!: string;

	@Column({ type: "varchar", length: 100 })
		slug!: string;

	@Column({ type: "text", nullable: true })
		description?: string | null;

	@Column({ type: "varchar", length: 500, nullable: true })
		imageUrl?: string | null;

	@Column({ type: "int", default: 0 })
		sortOrder!: number;

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
		updatedAt!: Date;
}
