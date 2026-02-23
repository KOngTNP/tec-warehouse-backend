import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('PurchasingUser')
export class PurchasingUserDto {
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
  // หากคุณมี CustomerDto แล้ว สามารถปลดคอมเมนต์เพื่อใช้งานการ Join ข้อมูลได้
  // @Field(() => CustomerDto, { nullable: true })
  // customer: CustomerDto;

  // หากต้องการดึงรายการใบเสนอราคาที่ PurchasingUser คนนี้เกี่ยวข้อง
  // @Field(() => [QuotationDto], { nullable: true })
  // quotation: QuotationDto[];
}

@ObjectType()
export class PaginatedPurchasingUser extends Paginated(PurchasingUserDto) {}