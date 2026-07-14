import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/modules/user/domain/entities/user.entity';

import { RequestStatus } from '@/modules/idempotency-record/type/idempotency-record';

@Entity({ name: 'IdempotencyRecord' })
@Index(['user', 'endpoint', 'idempotencyKey'], { unique: true })
export class IdempotencyRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  endpoint!: string;

  @Column({ type: 'varchar', length: 255 })
  idempotencyKey!: string;

  @Column({ type: 'varchar', length: 64 })
  requestHash!: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PROCESSING })
  status!: RequestStatus;

  @Column({ type: 'int', nullable: true })
  responseStatusCode!: number;

  @Column({ type: 'jsonb', nullable: true })
  responseBody!: string;

  @Column({ type: 'timestamptz' })
  @Index()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  user!: User;
}
