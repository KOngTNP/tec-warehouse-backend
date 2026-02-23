import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Customer')
export class CustomerDto {
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
  
    @Field(() => String, { nullable: true })
    zipCode: string;
  
    @Field(() => String, { nullable: true })
    area: string;
  
    @Field(() => String, { nullable: true })
    contact: string;
  
    @Field(() => String, { nullable: true })
    telNumber: string;
  
    @Field(() => Number, { nullable: true })
    creditTerm: number
  
    @Field(() => Number, { nullable: true })
    financialAmount: number
  
    @Field(() => String, { nullable: true })
    deliveryBy: string;
  
    @Field(() => String, { nullable: true })
    condition: string;
  
    @Field(() => String, { nullable: true })
    remark: string;

}

@ObjectType()
export class PaginatedCustomer extends Paginated(CustomerDto) {}
