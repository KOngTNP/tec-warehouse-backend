import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('ProductLastSellDetail')
export class ProductLastSellDetailDto {

  @Field(() => Date, { nullable: true })
  lastSellDate: Date;

  @Field(() => String, { nullable: true })
  lastSellUnit: string;

  @Field(() => Number, { nullable: true })
  lastSellUnitPrice: number;

  @Field(() => String, { nullable: true })
  lastSellDiscount: string;

  @Field(() => Number, { nullable: true })
  lastSellUnitPriceAfterDiscount: number;

  @Field(() => String, { nullable: true })
  lastSellVatType: string;

  @Field(() => Number, { nullable: true })
  lastSellTotalPrice: number;

  @Field(() => Number, { nullable: true })
  lastSellQuantity: number;

  @Field(() => String, { nullable: true })
  lastSellCustomerName: string;

  @Field(() => String, { nullable: true })
  lastSellCustomerContact: string;

  @Field(() => String, { nullable: true })
  lastSellOrderReference: string;
}

@ObjectType('ProductLastBuyDetail')
export class ProductLastBuyDetailDto {

  @Field(() => Date, { nullable: true })
  lastBuyDate: Date;

  @Field(() => String, { nullable: true })
  lastBuyUnit: string;

  @Field(() => Number, { nullable: true })
  lastBuyUnitPrice: number;

  @Field(() => String, { nullable: true })
  lastBuyDiscount: string;

  @Field(() => Number, { nullable: true })
  lastBuyUnitPriceAfterDiscount: number;

  @Field(() => String, { nullable: true })
  lastBuyVatType: string;

  @Field(() => Number, { nullable: true })
  lastBuyTotalPrice: number;

  @Field(() => Number, { nullable: true })
  lastBuyQuantity: number;

  @Field(() => String, { nullable: true })
  lastBuyVenderName: string;
  
  @Field(() => String, { nullable: true })
  lastBuyVenderContact: string;
  @Field(() => String, { nullable: true })
  lastBuyPurchaseReference: string;

  @Field(() => [String], { nullable: true })
  lastBuyRemark:string[]

  @Field(() => [String], { nullable: true })
  lastBuyCompareFileNumber:string[]
}


@ObjectType('SearchSuggestion')
export class SearchSuggestionDto {
  @Field(() => [ProductDto], { defaultValue: [] })
  products: ProductDto[];
}

@ObjectType('Product')
export class ProductDto {
  @Field()
  id: string;

  @Field()
  ExCode: string;

  @Field()
  name: string;

  @Field()
  unit: string;

  @Field()
  stock: number;
  
  @Field(() => String, { nullable: true })
  categoryId: string;

  @Field({ nullable: true })
  isGroup: boolean

    @Field(() => [String], { nullable: true })
  images: string[];

      @Field(() => [String], { nullable: true })
  videos: string[];

      @Field(() => [String], { nullable: true })
  dataSheets: string[];

  @Field(() => String, { nullable: true })
  brandId: string;
    @Field({ nullable: true })
  detail: string;


  @Field({ nullable: true })
  partstore: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => ProductLastSellDetailDto, { nullable: true })
  lastSellDetail?: ProductLastSellDetailDto;

  @Field(() => ProductLastBuyDetailDto, { nullable: true })
  lastBuyDetail?: ProductLastBuyDetailDto;
}



@ObjectType()
export class PaginatedProduct extends Paginated(ProductDto) {}