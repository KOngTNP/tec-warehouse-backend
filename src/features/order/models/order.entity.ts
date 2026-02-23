import { Customer } from 'src/features/customer/models/customer.entity';
import { Product } from 'src/features/product/models/product.entity';
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
import { OrderItem } from './order-item.entity';
import { OrderIv } from './order-iv.entity';
import { Company } from 'src/features/company/models/company.entity';

@Entity()
@Index('IDX_order_companyId', ['companyId'])
@Index('IDX_order_documentNumber_companyid', ['documentNumber', 'companyId'])
@Index('IDX_order_customerId', ['customerId'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  billNumber: string;

  @Column()
  date: Date;

  @Column('uuid', { nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.order)
  customer: Customer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];

  @OneToMany(() => OrderIv, (orderIv) => orderIv.order, {
    nullable: true
  })
  orderIv: OrderIv[];

  @Column()
  deliveryDate: Date;

  @Column({ nullable: true })
  creditTerm: number;

  @Column({ nullable: true })
  vatType: string;

  @Column({ nullable: true })
  discount: string;

  @Column({ nullable: true })
  deliveryBy: string

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPriceNoVat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  vat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({ nullable: true })
  reference: string


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.order, { nullable: true })
  company: Company;

}
