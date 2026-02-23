// ใน dto/update-quotation.args.ts (หรือในไฟล์เดียวกับ CreateQuotationInput)
import { InputType, Field, PartialType, ID, Int } from '@nestjs/graphql';
import { CreateQuotationInput } from './create-quotation.args';

@InputType()
export class UpdateQuotationInput extends PartialType(CreateQuotationInput) {
  @Field(() => ID)
  id: string; // บังคับส่ง ID ของใบเสนอราคา
}

@InputType()
export class UpdateQuotationItemProductSequenceInput {
  @Field()
  id: string;

  @Field(() => Int)
  sequence: number;
}