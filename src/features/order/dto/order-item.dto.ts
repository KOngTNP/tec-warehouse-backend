import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';
import { OrderDto } from './order.dto';

@ObjectType('OrderItem')
export class OrderItemDto {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field(() => String, { nullable: true })
  orderId: string;

  @Field(() => String, { nullable: true })
  productId: string;
  
  @Field(() => Boolean)
  isFree: boolean;

  @Field()
  sellName: string;

  @Field()
  actualQuantity: number

  @Field()
  quantity: number

  @Field()
  unit: string;

  @Field(() => Float)
  unitPrice: number;

  @Field({ nullable: true })
  discount: string;


  @Field(() => Float)
  totalPrice: number;

  @Field({ nullable: true })
  reference: string;

  @Field(() => OrderDto, {nullable: true})
  order?: OrderDto
}


@ObjectType('LastOrderItemDetail')
export class LastOrderItemDetail {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field(() => String, { nullable: true })
  orderId: string;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field()
  sellName: string;

  @Field()
  actualQuantity: number

  @Field()
  quantity: number

  @Field()
  unit: string;

  @Field(() => Float)
  unitPrice: number;

  @Field({ nullable: true })
  discount: string;


  @Field(() => Float)
  totalPrice: number;

  @Field({ nullable: true })
  reference: string;

  @Field(() => Date, { nullable: true })
  date: Date;

  @Field(() => String, { nullable: true })
  vatType: string;

  @Field(() => String, { nullable: true })
  customerName: string;

  @Field(() => String, { nullable: true })
  orderReference: string;

  @Field(() => String, { nullable: true })
  customerContact: string;
}

@ObjectType('OrderItemSummary')
export class OrderItemSummaryDto {
  @Field(() => Int)
  totalOrder: number;

  @Field(() => Int)
  totalQuantity: number;

  @Field(() => Float)
  totalRevenue: number;
}
 

@ObjectType()
export class PaginatedOrderItem extends Paginated(OrderItemDto) {}
