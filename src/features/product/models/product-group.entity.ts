import { Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  parentProductId: string;

  @ManyToOne(() => Product, (product) => product.parentGroups)
  @JoinColumn({ name: 'parentProductId' })
  parentProduct: Product;

  @Column('uuid', { nullable: true })
  childProductId: string;

  @ManyToOne(() => Product, (product) => product.childGroups)
  @JoinColumn({ name: 'childProductId' })
  childProduct: Product;

  @Column({ nullable: true })
  seqNumber: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;
}
