import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Category')
export class CategoryDto {
  @Field()
  id: string;

  @Field()
  ExCode: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string;
}

@ObjectType()
export class PaginatedCategory extends Paginated(CategoryDto) {}
