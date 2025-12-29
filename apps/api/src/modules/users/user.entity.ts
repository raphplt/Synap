import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
@Index(["email"], { unique: true })
@Index(["username"], { unique: true })
export class User {
	@PrimaryGeneratedColumn("uuid")
		id!: string;

	@Column({ type: "varchar", length: 255 })
		email!: string;

	@Column({ type: "varchar", length: 50 })
		username!: string;

	@Column({ type: "text" })
		passwordHash!: string;

	@Column({ type: "varchar", length: 500, nullable: true })
		avatarUrl?: string | null;

	@Column({ type: "int", default: 0 })
		xp!: number;

	@Column({ type: "int", default: 0 })
		streak!: number;

	@Column({ type: "timestamp with time zone", nullable: true })
		lastActivityAt?: Date | null;

	@Column({ type: "jsonb", default: [] })
		interests!: string[];

	@CreateDateColumn({ type: "timestamp with time zone" })
		createdAt!: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
		updatedAt!: Date;
}
