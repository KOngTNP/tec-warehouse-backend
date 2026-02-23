import { Company } from 'src/features/company/models/company.entity';
import { ComparePrice } from 'src/features/compare-price/models/compare-price.entity';
import { Product } from 'src/features/product/models/product.entity';
import { Purchase } from 'src/features/purchase/models/purchase.entity';
import { SaleUser } from 'src/features/sale-user/models/saleUser.entity';
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
@Index('IDX_vender_companyId', ['companyId'])
@Index('IDX_vender_excode_companyid', ['ExCode', 'companyId'])
export class Vender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  ExCode: string;

  @Column({ nullable: true })
  ExAcCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  creditTerm: number

  @Column({ nullable: true })
  financialCondition: string

  @Column({ nullable: true })
  financialAmount: number

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  telNumber: string;

  @Column({ nullable: true })
  remark: string;

  @Column('text',{ nullable: true })
  note: string;

  @OneToMany(() => Purchase, (purchase) => purchase.vender)
  purchase: Purchase[];

  @Column({ nullable: true })
  deliveryBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.vender, { nullable: true })
  company: Company;

  @OneToMany(() => ComparePrice, (comparePrice) => comparePrice.vender, { nullable: true })
  comparePrice: ComparePrice[];

  @OneToMany(() => SaleUser, (saleUser) => saleUser.vender, { nullable: true })
  saleUser: SaleUser[];

}
