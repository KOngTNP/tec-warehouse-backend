import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSaleUserInput {
  @Field() name: string;
  @Field() venderId: string; // อันนี้คือ venderId
  @Field({ nullable: true }) tel: string;
  @Field({ nullable: true }) email: string;
  @Field({ nullable: true }) lineId: string;
}