import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Vender')
export class VenderDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  ExCode: string;

  @Field(() => String, { nullable: true })
  ExAcCode: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  taxId: string;

  @Field(() => String, { nullable: true })
  branch: string;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => Number, { nullable: true })
  creditTerm: number

  @Field(() => String, { nullable: true })
  financialCondition: string

  @Field(() => Number, { nullable: true })
  financialAmount: number

  @Field(() => String, { nullable: true })
  contact: string;

  @Field(() => String, { nullable: true })
  telNumber: string;

  @Field(() => String, { nullable: true })
  remark: string;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => String, { nullable: true })
  deliveryBy: string;

  @Field(() => String, { nullable: true })
  companyId: string;
}

@ObjectType()
export class PaginatedVender extends Paginated(VenderDto) {}
