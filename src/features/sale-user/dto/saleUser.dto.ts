import { Field, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('SaleUser')
export class SaleUserDto {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  venderId: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  tel: string;

  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  lineId: string;

  @Field(() => String, { nullable: true })
  note: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  modifiedAt: Date;
}

@ObjectType()
export class PaginatedSaleUser extends Paginated(SaleUserDto) {}