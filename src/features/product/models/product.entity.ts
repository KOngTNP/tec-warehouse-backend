import { Category } from 'src/features/category/models/category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductGroup } from './product-group.entity';
import { Brand } from 'src/features/brand/models/brand.entity';
import { Company } from 'src/features/company/models/company.entity';
import { QuotationItem } from 'src/features/quotation/models/quotation-item.entity';
import { QuotationItemProduct } from 'src/features/quotation/models/quotation-item-product.entity';
import { ComparePrice } from 'src/features/compare-price/models/compare-price.entity';

@Entity()
@Index('IDX_product_companyId', ['companyId'])
@Index('IDX_product_excode_companyid', ['ExCode', 'companyId'])
@Index('IDX_product_categoryId', ['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Index({ fulltext: true })
  @Column({ nullable: true })
  ExCode: string;

  @Column()
  partstore: string;
  
  @Index({ fulltext: true })
  @Column()
  name: string;

  @Column()
  unit: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  stock: number;

  @Index({ fulltext: true })
  @Column({ nullable: true })
  description: string;

  @Index({ fulltext: true })
  @Column('text',{ nullable: true })
  detail: string;

  @Column({ type: 'bool', default: false })
  isGroup: boolean;

  @OneToMany(() => ProductGroup, (group) => group.parentProduct, { nullable: true })
  parentGroups: ProductGroup[];

  @OneToMany(() => ProductGroup, (group) => group.childProduct, { nullable: true })
  childGroups: ProductGroup[];
  
  @Column('uuid', { nullable: true })
  categoryId: string;
  
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

    /** Product image urls separated by comma */
  @Column('simple-array', { nullable: true })
  images: string[];

  /** Product video urls separated by comma */
  @Column('simple-array', { nullable: true })
  videos: string[];

  @Column('simple-array', { nullable: true })
  dataSheets: string[];
  
  @Column('uuid', { nullable: true })
  brandId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  brand: Brand;

  @ManyToMany(() => QuotationItem, (quotationItem) => quotationItem.products, { nullable: true })
  @JoinTable({
    name: 'product_quotation_items', // ชื่อ table กลาง (optional แต่แนะนำ)
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'quotationItemId',
      referencedColumnName: 'id',
    },
  })
  quotationItems: QuotationItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.products, { nullable: true })
  company: Company;

  @OneToMany(() => QuotationItemProduct, (quotationItemProduct) => quotationItemProduct.product, { nullable: true })
  quotationItemProduct: QuotationItemProduct[];

  @OneToMany(() => ComparePrice, (comparePrice) => comparePrice.product, { nullable: true })
  comparePrice: ComparePrice[];

}

// id
// ExCode
// partstore
// name
// unit
// description
// category
// createdAt
// modifiedAt
// deletedAt