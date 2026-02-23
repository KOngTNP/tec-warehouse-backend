import { Company } from 'src/features/company/models/company.entity';
import { Customer } from 'src/features/customer/models/customer.entity';
import { Product } from 'src/features/product/models/product.entity';
import { Purchase } from 'src/features/purchase/models/purchase.entity';
import { Quotation } from 'src/features/quotation/models/quotation.entity';
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

@Entity()
export class PurchasingUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.purchasingUser)
  customer: Customer;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  lineId: string;

  @Column('text',{ nullable: true })
  note: string;

  @OneToMany(() => Quotation, (quotation) => quotation.purchasingUser)
  quotation: Quotation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

}
