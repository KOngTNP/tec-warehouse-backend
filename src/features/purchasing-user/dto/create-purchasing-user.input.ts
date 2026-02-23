import { Field, InputType } from "@nestjs/graphql";

// features/purchasing-user/dto/create-purchasing-user.input.ts
@InputType()
export class CreatePurchasingUserInput {
  @Field() name: string;
  @Field() customerId: string; // อันนี้คือ customerId
  @Field({ nullable: true }) tel: string;
  @Field({ nullable: true }) email: string;
  @Field({ nullable: true }) lineId: string;
}