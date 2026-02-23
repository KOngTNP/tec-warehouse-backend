import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';
import { ComparePriceDto } from 'src/features/compare-price/dto/compare-price.dto'; // ปรับ path ตามจริง

@ObjectType('QuotationItemProduct')
export class QuotationItemProductDto {
  @Field()
  id: string;

    @Field(() => Int, { nullable: true })
    sequence: number;
    
  @Field(() => String, { nullable: true })
  quotationItemId: string;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field(() => [String], { nullable: true })
  workSheetImages: string[];

  @Field(() => String, { nullable: true })
  note: string;

  // เชื่อมโยงไปยังข้อมูลการเปรียบเทียบราคา (OneToMany)
  @Field(() => [ComparePriceDto], { nullable: true })
  comparePrices?: ComparePriceDto[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  modifiedAt: Date;
}

@ObjectType()
export class PaginatedQuotationItemProduct extends Paginated(QuotationItemProductDto) {}