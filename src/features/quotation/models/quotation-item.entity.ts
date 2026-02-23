import { Product } from 'src/features/product/models/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';
import { Customer } from 'src/features/customer/models/customer.entity';
import { QuotationItemProduct } from './quotation-item-product.entity';

export enum QuotationItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WATTING_PRICE_CONFIRMED = 'WATTING_PRICE_CONFIRMED',
  DONE = 'DONE',
  DISCONTINUE = 'DISCONTINUE',
  CANCELLED = 'CANCELLED',
}
@Entity()
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  sequence: number;

  @Column({ nullable: true })
  sellName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  unitPrice: number;

  @Column({ nullable: true })
  discount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalPriceNoVat: number;

    @Column({ nullable: true })
  vatType: string;

    @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: QuotationItemStatus,
    default: QuotationItemStatus.OPEN,
  })
  status: QuotationItemStatus;
  
  @Column('text',{ nullable: true })
  note: string;

  @Column('text',{ nullable: true })
  inSiderNote: string;

  @Column('simple-array', { nullable: true })
  inSiderFile: string[];

  @Column({ type: 'bool', default: false })
  isHidden: boolean;

  @Column({ type: 'bool', default: false })
  isObsolete: boolean;

  @Column({ nullable: true })
  productLink: string;


  @ManyToMany(() => Product, (product) => product.quotationItems, { nullable: true })
  products: Product[];
  
  @Column('uuid', { nullable: true })
  quotationId: string;

  @ManyToOne(() => Quotation, (quotation) => quotation.quotationItem)
  quotation: Quotation;

  @OneToMany(() => QuotationItemProduct, (quotationItemProduct) => quotationItemProduct.quotationItem, { nullable: true})
  quotationItemProduct: QuotationItemProduct[];


//  ------------------Old Order ------------------
  @Column({ nullable: true })
  oldQuantity: number;

  @Column({ nullable: true })
  oldUnit: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  oldUnitPrice: number;

  @Column({ nullable: true })
  oldDiscount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  oldTotalPriceNoVat: number;

    @Column({ nullable: true })
  oldVatType: string;

    @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  oldVat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  oldTotalPrice: number;

  @Column('uuid', { nullable: true })
  oldCustomerId: string;

  @ManyToOne(() => Customer, (customer) => customer.quotationItem, { nullable: true })
  oldCustomer: Customer;
    
  @Column({ nullable: true })
  oldName: string;

  @Column({ nullable: true })
  oldIv: string;

  @Column('text',{ nullable: true })
  oldNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

}
