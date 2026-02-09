import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  clerkUserId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username!: string | null;

  @Column({ type: 'text', nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  lastName!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'de-active' | 'deleted';

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role!: 'user' | 'admin';
}
