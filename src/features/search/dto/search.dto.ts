import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class SearchVenderResult {
    @Field()
  id: string;

  @Field()
  venderName: string;

  @Field({ nullable: true })
  venderTel?: string;

  @Field(() => Int)
  purchaseCount: number;

  @Field()
  productName: string;

  @Field()
  purchaseDate: Date;

  @Field(() => String)
  discount: string;

  @Field(() => Float)
  totalRelevance: number;
}
// @ObjectType()
// export class PaginatedSearch extends Paginated(SearchDto) {}
