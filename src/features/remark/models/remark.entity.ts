import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Remark {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  documentNumber: string;

  @Column()
  seqNumber: string;
  
  @Index({ fulltext: true })
  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column('uuid', { nullable: true })
  companyId: string;

}