import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

// ลงทะเบียน Enum สำหรับ GraphQL
export enum QuotationStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PRICE_CONFIRMED = 'PRICE_CONFIRMED',
  WAITING_FOR_QUOTATION_SEND = 'WAITING_FOR_QUOTATION_SEND',
  QUOTATION_SENT = 'QUOTATION_SENT',
  OP_OPENED = 'OP_OPENED',
  CANCELLED = 'CANCELLED',
  // เพิ่ม status อื่นๆ ตามที่มีในไฟล์ enum ของคุณ
}

registerEnumType(QuotationStatus, {
  name: 'QuotationStatus',
});

@ObjectType('Quotation')
export class QuotationDto {
  @Field(() => ID)
  id: string;

  @Field()
  quotationNumber: string;

  @Field(() => String, { nullable: true })
  companyId: string;

  @Field(() => String, { nullable: true })
  customerId: string;

  @Field(() => String, { nullable: true })
  purchasingUserId: string;

  @Field(() => String, { nullable: true })
  contact: string;

  @Field(() => String, { nullable: true })
  endUserId: string;

  @Field(() => String, { nullable: true })
  documentNumber: string;

  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  deliveryDueDate: string;

  @Field(() => String, { nullable: true })
  priceValidUntil: string;

  @Field(() => String, { nullable: true })
  paymentTerm: string;

  @Field(() => String, { nullable: true })
  quotedBy: string;

  @Field(() => Date, { nullable: true })
  quotedDate: Date;

  @Field(() => String, { nullable: true })
  priceApprovedBy: string;

  @Field(() => String, { nullable: true })
  leadChannel: string;

  @Field(() => Date, { nullable: true })
  leadReceivedDate: Date;

  @Field(() => [String], { nullable: true })
  images: string[];
  
  @Field(() => [String], { nullable: true })
  quotationDocuments: string[];

  @Field(() => String, { nullable: true })
  referenceLink: string;

  @Field(() => String, { nullable: true })
  reference: string;

  @Field(() => String, { nullable: true })
  salesUser: string;

  @Field(() => QuotationStatus)
  status: QuotationStatus;

  @Field(() => Date, { nullable: true })
  expirationDate: Date;

  @Field(() => String, { nullable: true })
  note: string;

  @Field({ nullable: true })
  inSiderNote: string;

  @Field(() => [String], { nullable: true })
  inSiderFile: string[];

  @Field(() => String, { nullable: true })
  userId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  modifiedAt: Date;

  // --- Relationships (ถ้าต้องการดึงข้อมูล Nested) ---
  
  // @Field(() => CustomerDto, { nullable: true })
  // customer: CustomerDto;

  // @Field(() => [QuotationItemDto], { nullable: true })
  // quotationItem: QuotationItemDto[];
}

@ObjectType()
export class PaginatedQuotation extends Paginated(QuotationDto) {}

@ObjectType()
export class QuotationStatusSummary {
  @Field(() => Int, { nullable: true }) OPEN: number;
  @Field(() => Int, { nullable: true }) IN_PROGRESS: number;
  @Field(() => Int, { nullable: true }) PRICE_CONFIRMED: number;
  @Field(() => Int, { nullable: true }) WAITING_FOR_QUOTATION_SEND: number;
  @Field(() => Int, { nullable: true }) QUOTATION_SENT: number;
  @Field(() => Int, { nullable: true }) OP_OPENED: number;
  @Field(() => Int, { nullable: true }) CANCELLED: number;
}