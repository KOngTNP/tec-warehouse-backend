import { Type, Abstract } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface IConnection<T> {
  totalCount: number;
  hasNextPage: boolean;
  nodes: T[];
}

type IType<T> = Type<T> | Abstract<T>;

/**
 * Dynamically create and return pagination type
 */
export function Paginated<T>(type: IType<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class Connection implements IConnection<T> {
    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;

    @Field(() => [type])
    nodes: T[];
  }

  return Connection;
}
