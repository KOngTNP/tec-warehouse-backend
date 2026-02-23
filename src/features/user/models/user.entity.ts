import { Quotation } from 'src/features/quotation/models/quotation.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending', // register and wait for information
}

export enum UserType {
  // PERSONAL = 'personal',
  PURCHASE = 'purchase',
  SALES = 'sales',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.PURCHASE,
  })
  userType: UserType;

  @OneToMany(() => Quotation, (quotation) => quotation.user)
  quotation: Quotation[];

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  modifiedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;
  @Column({ nullable: true, default: 0 })
  loginAttempt: number;

  @Column({ nullable: true })
  attemptLifeTime: Date;

  @Column({ nullable: true,})
  resetPasswordCode: string;

}

// id
// firstName
// lastName
// email
// status
// lastLogin
// userType
// createdAt
// modifiedAt
// deletedAt
// loginAttempt
// attemptLifeTime
// resetPasswordCode