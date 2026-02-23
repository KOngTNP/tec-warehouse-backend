import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateQuotationItemProductInput {
  @Field(() => String, { nullable: true })
  quotationItemId?: string;

  @Field(() => String)
  productId: string;

  @Field(() => [String], { nullable: true })
  workSheetImages?: string[];

  @Field(() => String, { nullable: true })
  note?: string;
}