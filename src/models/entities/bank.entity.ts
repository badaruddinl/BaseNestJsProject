import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

export enum TypeStatusBanks {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'banks' })
export class Banks extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  user_id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  bank_name: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  account_name: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  account_number: string;

  @Column({
    type: 'enum',
    enum: TypeStatusBanks,
    default: TypeStatusBanks.ACTIVE,
  })
  status: TypeStatusBanks;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isDefault: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  updated_at: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  deleted_at: Date;

  @ManyToOne(() => Users, (users) => users.banks)
  @JoinColumn({ name: 'user_id' })
  banks_user: Users;
}
