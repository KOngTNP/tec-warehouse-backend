import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';
import { QuotationItemProductDto } from './quotation-item-product.dto';

// 1. ลงทะเบียน Enum สำหรับ QuotationItemStatus
export enum QuotationItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WATTING_PRICE_CONFIRMED = 'WATTING_PRICE_CONFIRMED',
  DONE = 'DONE',
  DISCONTINUE = 'DISCONTINUE',
  CANCELLED = 'CANCELLED',
}

registerEnumType(QuotationItemStatus, {
  name: 'QuotationItemStatus',
  description: 'The status of an individual item within a quotation',
});

@ObjectType('QuotationItem')
export class QuotationItemDto {
  @Field()
  id: string;

  @Field(() => Int, { nullable: true })
  sequence: number;

  @Field({ nullable: true })
  sellName: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => Int, { nullable: true })
  quantity: number;

  @Field(() => Float, { nullable: true })
  vat: number;

  @Field({ nullable: true })
  unit: string;

  @Field(() => Float, { nullable: true })
  unitPrice: number;

  @Field(() => Float, { nullable: true })
  totalPrice: number;
  @Field(() => Float, { nullable: true })
  totalPriceNoVat: number;
  @Field(() => QuotationItemStatus)
  status: QuotationItemStatus;

    @Field({ nullable: true })
  note: string;

  @Field({ nullable: true })
  inSiderNote: string;

  @Field(() => [String], { nullable: true })
  inSiderFile: string[];

  @Field(() => Boolean)
  isHidden: boolean;
    @Field(() => Boolean)
  isObsolete: boolean;

  @Field({ nullable: true })
  quotationId: string;

    @Field({ nullable: true })
  productLink: string;


  // เชื่อมโยงไปยังรายละเอียดสินค้าภายในเซ็ต (Bundle Components)
  @Field(() => [QuotationItemProductDto], { nullable: true })
  quotationItemProduct?: QuotationItemProductDto[];

  // --- ฟิลด์ข้อมูลประวัติเก่า (Old Order Snapshot) ---
  @Field(() => Float, { nullable: true })
  oldUnitPrice: number;

  @Field(() => Float, { nullable: true })
  oldTotalPrice: number;

  @Field({ nullable: true })
  oldIv: string; // เลขที่ใบกำกับภาษีเดิม

  @Field({ nullable: true })
  oldName: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  modifiedAt: Date;
}

@ObjectType()
export class PaginatedQuotationItem extends Paginated(QuotationItemDto) {}