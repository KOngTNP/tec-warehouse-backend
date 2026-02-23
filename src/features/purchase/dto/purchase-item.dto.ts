import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';
import { PurchaseDto } from './purchase.dto';

@ObjectType('PurchaseItem')
export class PurchaseItemDto {
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
  
  @Field({ nullable: true })
  companyId: string;
}
@ObjectType('PurchaseItemSummary')
export class PurchaseItemSummaryDto {
  @Field(() => Int)
  totalPurchase: number;

  @Field(() => Int)
  totalQuantity: number;

  @Field(() => Float)
  totalRevenue: number;
}

@ObjectType('LastPurchaseItemDetail')
export class LastPurchaseItemDetail {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field(() => String, { nullable: true })
  purchaseId: string;

  @Field(() => String, { nullable: true })
  productId: string;

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

  @Field({ nullable: true })
  reference: string;
  
@Field(() => [String], { nullable: true })
remark: string[];

@Field(() => [String], { nullable: true })
  compareFileNumber: string[]

  @Field(() => Date, { nullable: true })
  date: Date;

  @Field(() => String, { nullable: true })
  vatType: string;

  @Field(() => String, { nullable: true })
  venderName: string;

  @Field(() => String, { nullable: true })
  purchaseReference: string;

  @Field(() => String, { nullable: true })
  venderContact: string;
}





@ObjectType()
export class PaginatedPurchaseItem extends Paginated(PurchaseItemDto) {}
