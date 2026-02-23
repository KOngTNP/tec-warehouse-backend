import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';
import { DeliveryType, SourceType } from '../models/compare-price.entity';

// ลงทะเบียน Enum ให้ GraphQL รู้จัก
registerEnumType(SourceType, { name: 'SourceType' });
registerEnumType(DeliveryType, { name: 'DeliveryType' });

@ObjectType('ComparePrice')
export class ComparePriceDto {
  @Field()
  id: string;

    @Field(() => Int, { nullable: true })
  sequence: number;
  
  @Field(() => String, { nullable: true })
  quotationItemProductId: string;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field(() => String, { nullable: true })
  venderId: string;

  @Field(() => String, { nullable: true })
  saleUserId: string;

  @Field(() => String, { nullable: true })
  buyName: string;

  @Field(() => String, { nullable: true })
  financialCondition: string;

  @Field(() => String, { nullable: true })
  leadTime: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => [String], { nullable: true })
  quotations: string[];

  @Field(() => Int, { nullable: true })
  quantity: number;

  @Field(() => String, { nullable: true })
  unit: string;

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => Float, { nullable: true })
  unitPrice: number;

  @Field(() => String, { nullable: true })
  discount: string;

  @Field(() => Float, { nullable: true })
  totalPriceNoVat: number;

  @Field(() => String, { nullable: true })
  vatType: string;

  @Field(() => Float, { nullable: true })
  vat: number;

  @Field(() => Float, { nullable: true })
  totalPrice: number;

  @Field(() => DeliveryType)
  deliveryType: DeliveryType;

  @Field(() => Float, { nullable: true })
  deliveryPrice: number;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => Boolean)
  isPick: boolean;
  
  @Field(() => String, { nullable: true })
  pickNote: string;

  @Field(() => String, { nullable: true })
  pickBy: string;

  @Field(() => Boolean)
  isDisable: boolean;
  
  @Field(() => String, { nullable: true })
  disableNote: string;

  @Field(() => String, { nullable: true })
  disableBy: string;
  
  @Field(() => Boolean)
  isOutOfStock: boolean;
    
  @Field(() => String)
  currency: string

  @Field(() => SourceType)
  sourceType: SourceType;

  @Field(() => String, { nullable: true })
  poNumber: string

  @Field(() => String, { nullable: true })
  OldRr: string;

  @Field(() => String, { nullable: true })
  createBy: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  modifiedAt: Date;
@Field({ nullable: true })
  deletedAt: Date;
}

@ObjectType()
export class PaginatedComparePrice extends Paginated(ComparePriceDto) {}