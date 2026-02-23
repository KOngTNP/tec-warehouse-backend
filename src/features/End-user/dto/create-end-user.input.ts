import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateEndUserInput {
  @Field() name: string;
  @Field() customerId: string; // อันนี้คือ customerId
  @Field({ nullable: true }) tel: string;
  @Field({ nullable: true }) email: string;
  @Field({ nullable: true }) lineId: string;
}