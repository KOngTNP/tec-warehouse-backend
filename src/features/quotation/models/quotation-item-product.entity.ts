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
import { QuotationItem } from './quotation-item.entity';
import { ComparePrice } from 'src/features/compare-price/models/compare-price.entity';

@Entity()
export class QuotationItemProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    sequence: number;

    @Column('uuid', { nullable: true })
    quotationItemId: string;

    @ManyToOne(() => QuotationItem, (quotationItem) => quotationItem.quotationItemProduct)
    quotationItem: QuotationItem;

    @Column('uuid', { nullable: true })
    productId: string;

    @ManyToOne(() => Product, (product) => product.quotationItemProduct)
    product: Product;

    @OneToMany(() => ComparePrice, (comparePrice) => comparePrice.quotationItemProduct, { nullable: true })
    comparePrice: ComparePrice[];

    @Column('simple-array', { nullable: true })
    workSheetImages: string[];

    @Column('text',{ nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}
