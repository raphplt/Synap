import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'cards' })
@Index(['sourceLink'], { unique: true })
@Index(['sourceType', 'sourceId'], { unique: true })
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text' })
  mediaUrl!: string;

  @Column({ type: 'text' })
  sourceLink!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceAttribution?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sourceType?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceId?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
