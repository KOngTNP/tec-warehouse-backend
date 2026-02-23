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
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column('uuid', { nullable: true })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderItem)
  order: Order;

  @Column('uuid', { nullable: true })
  productId: string;
  
  @ManyToOne(() => Product, { nullable: true })
  product: Product;

  @Index({ fulltext: true })
  @Column()
  sellName: string;

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
