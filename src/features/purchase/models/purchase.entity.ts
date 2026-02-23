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
import { PurchaseItem } from './purchase-item.entity';
import { Vender } from 'src/features/vender/models/vender.entity';
import { PurchaseRr } from './purchase-rr.entity';
import { Company } from 'src/features/company/models/company.entity';

@Entity()
@Index('IDX_purchase_companyId', ['companyId'])
@Index('IDX_purchase_documentNumber_companyid', ['documentNumber', 'companyId'])
@Index('IDX_purchase_venderId', ['venderId'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column({ nullable: true})
  purchaseNumber: string;
  
  @Column()
  date: Date;

  @Column('uuid', { nullable: true })
  venderId: string;

  @ManyToOne(() => Vender, (vender) => vender.purchase)
  vender: Vender;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.purchase)
  purchaseItem: PurchaseItem[];

  @OneToMany(() => PurchaseRr, (purchaseRr) => purchaseRr.purchase,
 {
    nullable: true
  })
  purchaseRr?: PurchaseRr[];


  @Column()
  receiptDate: Date;


  @Column({ nullable: true })
  creditTerm: number;

  @Column({ nullable: true })
  vatType: string;

  @Column({ nullable: true })
  discount: string;

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
  deliveryBy: string

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

  @ManyToOne(() => Company, (company) => company.purchase, { nullable: true })
  company: Company;

}
