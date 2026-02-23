import { Category } from 'src/features/category/models/category.entity';
import { Customer } from 'src/features/customer/models/customer.entity';
import { Order } from 'src/features/order/models/order.entity';
import { Product } from 'src/features/product/models/product.entity';
import { Purchase } from 'src/features/purchase/models/purchase.entity';
import { Vender } from 'src/features/vender/models/vender.entity';
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

@Entity()
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    taxId: string;

    @Column({ nullable: true })
    taxAddress: string;

    @Column({ nullable: true })
    branch: string;

    @OneToMany(() => Product, (product) => product.company)
    products: Product[];

    @OneToMany(() => Category, (category) => category.company)
    category: Category[];

    @OneToMany(() => Customer, (customer) => customer.company)
    customer: Customer[];

    @OneToMany(() => Vender, (vender) => vender.company)
    vender: Vender[];

    @OneToMany(() => Order, (order) => order.company)
    order: Order[];

    @OneToMany(() => Purchase, (purchase) => purchase.company)
    purchase: Purchase[];


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}
