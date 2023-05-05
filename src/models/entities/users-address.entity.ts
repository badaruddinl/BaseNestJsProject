import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';

export enum TypeStatusAddress {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'users_address' })
export class UsersAddress extends BaseEntity {
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
  phone: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  address: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  zipcode: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  city: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  province: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  country: string;

  @Column({
    type: 'enum',
    enum: TypeStatusAddress,
    default: TypeStatusAddress.ACTIVE,
  })
  status: TypeStatusAddress;

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

  @ManyToOne(() => Users, (user) => user.address)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
