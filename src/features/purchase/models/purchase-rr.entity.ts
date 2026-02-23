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
import { Purchase } from './purchase.entity';

@Entity()
export class PurchaseRr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column()
  date: Date;

  @Column('uuid', { nullable: true })
  purchaseId: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.purchaseRr, {
    nullable: true,
  })
  purchase: Purchase;

    @Index({ fulltext: true })
  @Column()
  buyName: string;

  @Column('uuid', { nullable: true })
  productId: string;
  
  @ManyToOne(() => Product, { nullable: true })
  product: Product;

  @Column({ nullable: true })
  seqNumber: number;

    @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  actualQuantity: number
  
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number

  @Column()
  unit: string;

  @Column({ type: 'bool', default: false })
  isFree: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;
  
  @Column({ nullable: true })
  discount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;



  @Column({ nullable: true })
  reference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

}
