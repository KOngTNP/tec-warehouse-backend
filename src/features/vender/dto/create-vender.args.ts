import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateVenderInput {
  @Field()
  type: string; // เช่น 'ผู้จำหน่ายเครดิต', 'ผู้จำหน่ายโอนเงิน', 'ผู้จำหน่ายเงินสด', 'ผู้จำหน่ายรับเช็ค', 'ผู้จำหน่ายออนไลน์', 'ผู้จำหน่ายต่างประเทศ'

  @Field()
  ExCode: string; // รหัส Vender เดิมจากระบบบัญชี

  @Field({ nullable: true })
  ExAcCode?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  branch?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field(() => Int, { nullable: true })
  creditTerm?: number;

  @Field({ nullable: true })
  financialCondition?: string;

  @Field(() => Float, { nullable: true })
  financialAmount?: number;

  @Field({ nullable: true })
  contact?: string;

  @Field({ nullable: true })
  telNumber?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  deliveryBy?: string;

  @Field({ nullable: true })
  note?: string;
  
  @Field(() => String, { nullable: true })
  companyId?: string;
}