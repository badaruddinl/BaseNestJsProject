import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Banks } from './bank.entity';
import { UsersAddress } from './users-address.entity';

export enum TypeUser {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
}

export enum AdminType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  NON_ADMIN = 'NON_ADMIN',
}

export enum TypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Entity({ name: 'users' })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: AdminType,
    default: AdminType.NON_ADMIN,
  })
  role: AdminType;

  @Column({
    type: 'enum',
    enum: TypeUser,
    default: TypeUser.USER,
  })
  typeuser: TypeUser;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  photo: string;

  @Column({
    type: 'enum',
    enum: TypeStatus,
    default: TypeStatus.ACTIVE,
  })
  status: TypeStatus;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
  })
  @Index({ fulltext: true })
  keyword: string;

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

  @OneToMany(() => UsersAddress, (address) => address.user)
  @JoinColumn({ name: 'id' })
  address: UsersAddress[];

  @OneToMany(() => Banks, (banks) => banks.banks_user)
  @JoinColumn({ name: 'id' })
  banks: Banks[];
}
