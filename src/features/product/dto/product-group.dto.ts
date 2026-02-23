import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductDto } from './product.dto';

@ObjectType('ProductGroup')
export class ProductGroupDto {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  parentProductId?: string;

  @Field(() => ID, { nullable: true })
  childProductId?: string;

  @Field(() => Float, { nullable: true })
  quantity?: number;

  @Field(() => Int, { nullable: true })
  seqNumber?: number;

  // @Field(() => ProductDto, { nullable: true })
  // parentProduct?: ProductDto;

  // @Field(() => ProductDto, { nullable: true })
  // childProduct?: ProductDto;
}