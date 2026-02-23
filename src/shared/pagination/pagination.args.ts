import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

/**
 * Shared sort direction enum for sorting arg in GraphQL
 */
export enum SortDirection {
  ASC,
  DESC,
}
registerEnumType(SortDirection, { name: 'SortDirection' });
