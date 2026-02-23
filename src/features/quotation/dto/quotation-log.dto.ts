import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('QuotationLog')
export class QuotationLogDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  detail: string;

  @Field(() => Date)
  timeStamp: Date;

  @Field({ nullable: true })
  note: string;

  @Field(() => String, { nullable: true })
  quotationId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  modifiedAt: Date;

  // --- Relationships ---
  // หากต้องการดึงข้อมูล Quotation ที่เกี่ยวข้องผ่าน Log
  // @Field(() => QuotationDto, { nullable: true })
  // quotation: QuotationDto;
}

@ObjectType()
export class PaginatedQuotationLog extends Paginated(QuotationLogDto) {}