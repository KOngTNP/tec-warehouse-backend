import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Brand')
export class BrandDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string;
}

@ObjectType()
export class PaginatedBrand extends Paginated(BrandDto) {}
