import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';
import { OrderDto } from './order.dto';
import { ProductDto } from 'src/features/product/dto/product.dto';

@ObjectType('OrderIv')
export class OrderIvDto {
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
  date: Date;

    @Field()
  sellName: string;

  @Field({ nullable: true })
  seqNumber: number

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

  @Field(() => ProductDto, {nullable: true})
  product?: ProductDto
    
}

@ObjectType()
export class PaginatedOrderIv extends Paginated(OrderIvDto) {}
