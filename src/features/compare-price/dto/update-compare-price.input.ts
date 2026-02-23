import { Field, ID, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateComparePriceInput } from "./create-compare-price.input";

@InputType()
export class UpdateComparePriceInput extends PartialType(CreateComparePriceInput) {
  @Field(() => ID)
  id: string;
}

@InputType()
export class UpdateComparePriceSequenceInput {
  @Field()
  id: string;

  @Field(() => Int)
  sequence: number;
}