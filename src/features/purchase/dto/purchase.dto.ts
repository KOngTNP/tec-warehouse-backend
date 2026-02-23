import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Purchase')
export class PurchaseDto {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field()
  date: Date;

  @Field(() => String, { nullable: true })
  venderId: string;

  @Field()
  receiptDate: Date;

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

    @Field(() => String, { nullable: true })
  purchaseNumber: string;
}

@ObjectType('VatSummaryResponse')
export class VatSummaryResponse {
  @Field(() => String, { nullable: true })
  vatType: string;

  @Field(() => String, { nullable: true })
  text: string;
}

@ObjectType()
export class PaginatedPurchase extends Paginated(PurchaseDto) {}
