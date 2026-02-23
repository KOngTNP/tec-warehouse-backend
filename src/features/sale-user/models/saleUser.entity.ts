import { Company } from 'src/features/company/models/company.entity';
import { Vender } from 'src/features/vender/models/vender.entity';
import { Product } from 'src/features/product/models/product.entity';
import { Purchase } from 'src/features/purchase/models/purchase.entity';
import { Quotation } from 'src/features/quotation/models/quotation.entity';
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
import { ComparePrice } from 'src/features/compare-price/models/compare-price.entity';

@Entity()
export class SaleUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  venderId: string;

  @ManyToOne(() => Vender, (vender) => vender.saleUser)
  vender: Vender;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  lineId: string;

  @Column('text',{ nullable: true })
  note: string;

  @OneToMany(() => ComparePrice, (comparePrice) => comparePrice.saleUser)
  comparePrice: ComparePrice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

}
