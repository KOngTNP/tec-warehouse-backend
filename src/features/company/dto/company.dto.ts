import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Company')
export class CompanyDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string;
    @Field(() => String, { nullable: true })
  address: string;

    @Field(() => String, { nullable: true })
  taxId: string;

    @Field(() => String, { nullable: true })
  taxAddress: string;

    @Field(() => String, { nullable: true })
  branch: string;
}

@ObjectType()
export class PaginatedCompany extends Paginated(CompanyDto) {}
