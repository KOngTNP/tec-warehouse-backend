import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { DeliveryType, SourceType } from '../models/compare-price.entity';
import { GraphQLScalarType } from 'graphql';


const AnyHybridComparePrice = new GraphQLScalarType({
  name: 'AnyHybridComparePrice',
  description: 'ยอมรับทั้ง String URL และ File Upload',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast: any) => ast.value,
});


@InputType()
export class CreateComparePriceInput {
  @Field()
  quotationItemProductId: string;

  @Field()
  productId: string;

  @Field({ nullable: true })
  venderId?: string;

  @Field({ nullable: true })
  saleUserId?: string;

  @Field({ nullable: true })
  buyName?: string; // กรณีร้านค้าขาจร

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  unit?: string;

  @Field({ nullable: true })
  vatType?: string; // "รวม VAT", "บวก VAT", "No VAT"

  @Field({ nullable: true })
  leadTime?: string;

  @Field(() => DeliveryType, { defaultValue: DeliveryType.DELIVERY })
  deliveryType: DeliveryType;

  @Field(() => Float, { defaultValue: 0 })
  deliveryPrice: number;

  @Field({ nullable: true })
  note?: string;

  @Field({ defaultValue: 'THB' })
  currency: string;

  @Field(() => SourceType, { defaultValue: SourceType.NEW })
  sourceType: SourceType;

  @Field({ nullable: true })
  link?: string;

  @Field({ nullable: true })
  OldRr?: string;

  @Field({ nullable: true })
  discount?: string;

  // ฟิลด์เหล่านี้ปกติจะคำนวณที่ Backend แต่ถ้าต้องการรับจาก Frontend ให้ใส่ไว้ครับ
  @Field(() => Float, { nullable: true })
  totalPriceNoVat?: number;

  @Field(() => Float, { nullable: true })
  vat?: number;

  @Field(() => Float, { nullable: true })
  totalPrice?: number;

  @Field(() => Boolean, {defaultValue: false})
  isOutOfStock: boolean;

  @Field(() => [AnyHybridComparePrice], { nullable: 'itemsAndList' }) 
  images?: any[];
  
  @Field(() => [AnyHybridComparePrice], { nullable: 'itemsAndList' }) 
  quotations?: any[];
}