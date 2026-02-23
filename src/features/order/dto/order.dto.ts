import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Order')
export class OrderDto {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field(() => String, { nullable: true })
  invoiceNumber: string;

  @Field(() => String, { nullable: true })
  billNumber: string;

  @Field()
  date: Date;

  @Field(() => String, { nullable: true })
  customerId: string;

  @Field()
  deliveryDate: Date;

  @Field({ nullable: true })
  creditTerm: number;

  @Field({ nullable: true })
  vatType: string;

  @Field({ nullable: true })
  discount: string;

    @Field({ nullable: true })
  deliveryBy: string;
  
  @Field(() => Float)
  totalPriceNoVat: number;

  @Field(() => Float)
  vat: number;

  @Field(() => Float)
  totalPrice: number;


  @Field({ nullable: true })
  reference: string
}

@ObjectType()
export class PaginatedOrder extends Paginated(OrderDto) {}
