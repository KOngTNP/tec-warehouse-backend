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
import { QuotationLog } from './quotation-log.entity';
import { QuotationItem } from './quotation-item.entity';
import { User } from 'src/features/user/models/user.entity';

export enum QuotationStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PRICE_CONFIRMED = 'PRICE_CONFIRMED',
  WAITING_FOR_QUOTATION_SEND = 'WAITING_FOR_QUOTATION_SEND',
  QUOTATION_SENT = 'QUOTATION_SENT',
  OP_OPENED = 'OP_OPENED',
  CANCELLED = 'CANCELLED',
}
@Entity()
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationNumber: string;

  @Column({ nullable: true })
  PONumber: string;

  @Column({ nullable: true })
  POReceivedDate: Date;

  @Column({ nullable: true })
  PODueDate: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.category, { nullable: true })
  company: Company;

  @Column('uuid', { nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.quotation)
  customer: Customer;

  @Column('uuid', { nullable: true })
  purchasingUserId: string;

  @ManyToOne(() => PurchasingUser, (purchasingUser) => purchasingUser.quotation)
  purchasingUser: Purchase;

  @Column({ nullable: true })
  contact: string;
  
  @Column('uuid', { nullable: true })
  endUserId: string;

  @ManyToOne(() => EndUser, (endUser) => endUser.quotation)
  endUser: EndUser;

  @Column({ nullable: true })
  documentNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  deliveryDueDate: string;

  @Column({ nullable: true })
  priceValidUntil: string;

  @Column({ nullable: true })
  paymentTerm: string;

  @Column({ nullable: true })
  quotedBy: string;

  @Column({ nullable: true })
  quotedDate: Date;

  @Column({ nullable: true })
  priceApprovedBy: string;

  @Column({ nullable: true })
  leadChannel: string

  @Column({ nullable: true })
  leadReceivedDate: Date
  
  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  quotationDocuments: string[];

  @Column({ nullable: true })
  referenceLink: string;
  
  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  salesUser: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.OPEN,
  })
  status: QuotationStatus;

  // @OneToMany(() => QuotationLog, (quotationLog) => quotationLog.quotation, { nullable: true })
  // quotationLog: QuotationLog[];

  @OneToMany(() => QuotationItem, (quotationItem) => quotationItem.quotation, { nullable: true })
  quotationItem: QuotationItem[];

  @Column({ nullable: true })
  expirationDate: Date;

  @Column('text',{ nullable: true })
  note: string;

  @Column('text',{nullable: true })
  inSiderNote: string;
  
    @Column('simple-array', { nullable: true })
  inSiderFile: string[];

  @Column('uuid', { nullable: true })
  userId: string;
  
  @ManyToOne(() => User, (user) => user.quotation, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;


}
