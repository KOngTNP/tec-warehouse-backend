import { Product } from 'src/features/product/models/product.entity';
import { QuotationItemProduct } from 'src/features/quotation/models/quotation-item-product.entity';
import { SaleUser } from 'src/features/sale-user/models/saleUser.entity';
import { Vender } from 'src/features/vender/models/vender.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SourceType {
  NEW = 'NEW',
  LEGACY = 'LEGACY',
}

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

@Entity()
export class ComparePrice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { nullable: true })
    quotationItemProductId: string;
    
    @ManyToOne(() => QuotationItemProduct, (quotationItemProduct) => quotationItemProduct.comparePrice, { nullable: true })
    quotationItemProduct: QuotationItemProduct;


    @Column('uuid', { nullable: true })
    productId: string;
    
    @ManyToOne(() => Product, (product) => product.comparePrice)
    product: Product;

    @Column('uuid', { nullable: true })
    venderId: string;
    
    @ManyToOne(() => Vender, (vender) => vender.comparePrice)
    vender: Vender;


    @Column('uuid', { nullable: true })
    saleUserId: string;
    
    @ManyToOne(() => SaleUser, (saleUser) => saleUser.comparePrice)
    saleUser: SaleUser;

    @Column({ nullable: true })
    buyName: string;

    @Column({ nullable: true })
    financialCondition: string;

    @Column({ nullable: true })
    leadTime: string;

    @Column({ 
      type: "text",     // หรือ "longtext" สำหรับ MySQL/MariaDB ถ้าต้องการยาวมากๆ
      nullable: true 
    })
    link: string;
    
  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  quotations: string[];

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
    enum: DeliveryType,
    default: DeliveryType.DELIVERY,
  })
  deliveryType: DeliveryType;

    @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
  })
  deliveryPrice: number;

    @Column('text',{ nullable: true })
  note: string;

      @Column({
        type: 'enum',
        enum: SourceType,
        default: SourceType.NEW,
      })
      sourceType: SourceType;


  @Column({default: 'THB'})
  currency: string
@Column({ nullable: true })
      OldRr: string;



    @Column({ type: 'bool', default: false })
  isPick: boolean;


  @Column('text',{ nullable: true })
  pickNote: string;

  
  @Column({ nullable: true })
  poNumber: string;

  @Column({ nullable: true })
  sequence: number;

  @Column({ type: 'bool', default: false })
  isOutOfStock: boolean;

  @Column({ type: 'bool', default: false })
  isDisable: boolean;
  
  @Column('text',{ nullable: true })
  disableNote: string;

    @Column({ nullable: true })
    createBy: string;

  @Column({ nullable: true })
  pickBy: string;

  @Column({ nullable: true })
  disableBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}
