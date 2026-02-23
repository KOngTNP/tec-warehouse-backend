import { Company } from 'src/features/company/models/company.entity';
import { EndUser } from 'src/features/End-user/models/endUser.entity';
import { Order } from 'src/features/order/models/order.entity';
import { Product } from 'src/features/product/models/product.entity';
import { PurchasingUser } from 'src/features/purchasing-user/models/purchasingUser.entity';
import { QuotationItem } from 'src/features/quotation/models/quotation-item.entity';
import { Quotation } from 'src/features/quotation/models/quotation.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index('IDX_customer_companyId', ['companyId'])
@Index('IDX_customer_excode_companyid', ['ExCode', 'companyId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  ExCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  ExAcCode: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  telNumber: string;

  @Column({ nullable: true })
  creditTerm: number

  @Column({ nullable: true })
  financialAmount: number

  @Column({ nullable: true })
  deliveryBy: string;

  @Column({ nullable: true })
  condition: string;

  @Column({ nullable: true })
  remark: string;

  @OneToMany(() => Order, (order) => order.customer)
  order: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.customer, { nullable: true })
  company: Company;

  @OneToMany(() => Quotation, (quotation) => quotation.customer)
  quotation: Quotation[];

  @OneToMany(() => QuotationItem, (quotationItem) => quotationItem.oldCustomer)
  quotationItem: QuotationItem[];

  @OneToMany(() => PurchasingUser, (purchasingUser) => purchasingUser.customer)
  purchasingUser: PurchasingUser[];

  @OneToMany(() => EndUser, (endUser) => endUser.customer)
  endUser: EndUser[];
}
