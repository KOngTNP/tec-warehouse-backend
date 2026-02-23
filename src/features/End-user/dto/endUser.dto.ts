import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('EndUser')
export class EndUserDto {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  companyId: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  tel: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  lineId: string;

  @Field({ nullable: true })
  note: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  modifiedAt: Date;

  // --- Relationships ---
  // หากต้องการดึงข้อมูลบริษัทลูกค้าที่ EndUser นี้สังกัดอยู่
  // @Field(() => CustomerDto, { nullable: true })
  // customer: CustomerDto;

  // หากต้องการดึงรายการใบเสนอราคาที่เกี่ยวข้องกับ EndUser ท่านนี้
  // @Field(() => [QuotationDto], { nullable: true })
  // quotation: QuotationDto[];
}
@ObjectType()
export class PaginatedEndUser extends Paginated(EndUserDto) {}