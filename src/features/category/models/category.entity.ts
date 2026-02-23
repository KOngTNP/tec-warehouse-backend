import { Company } from 'src/features/company/models/company.entity';
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

@Entity()
@Index('IDX_category_companyId', ['companyId'])
@Index('IDX_category_excode_companyid', ['ExCode', 'companyId'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ExCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.category, { nullable: true })
  company: Company;

}
