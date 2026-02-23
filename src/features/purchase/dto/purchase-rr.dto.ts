import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';
import { PurchaseDto } from './purchase.dto';
import { ProductDto } from 'src/features/product/dto/product.dto';

@ObjectType('PurchaseRr')
export class PurchaseRrDto {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field(() => String, { nullable: true })
  purchaseId: string;

  @Field(() => String, { nullable: true })
  productId: string;

    @Field()
  buyName: string;

    @Field()
  date: Date;

    
  @Field()
  seqNumber: number

  @Field()
  actualQuantity: number
  
  @Field()
  quantity: number

  @Field()
  unit: string;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  totalPrice: number;

  @Field({ nullable: true })
  discount: string;

    @Field(() => Boolean)
  isFree: boolean;
  

  @Field({ nullable: true })
  reference: string;

  @Field(() => [String], { nullable: true })
  remark: string[];

  @Field(() => [String], { nullable: true })
  compareFileNumber: string[]

  @Field(() => PurchaseDto, {nullable: true})
  purchase?: PurchaseDto

    @Field(() => ProductDto, {nullable: true})
  product?: ProductDto
  
}





@ObjectType()
export class PaginatedPurchaseRr extends Paginated(PurchaseRrDto) {}
