import { Company } from 'src/features/company/models/company.entity';
import { Customer } from 'src/features/customer/models/customer.entity';
import { EndUser } from 'src/features/End-user/models/endUser.entity';
import { Product } from 'src/features/product/models/product.entity';
import { Purchase } from 'src/features/purchase/models/purchase.entity';
import { PurchasingUser } from 'src/features/purchasing-user/models/purchasingUser.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity()
export class QuotationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    subject: string;

    @Column('text',{ nullable: true })
    detail: string;

    @Column()
    timeStamp: Date;

    @Column('text',{ nullable: true })
    note: string;

    @Column('uuid', { nullable: true })
    affectedId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}
