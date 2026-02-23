// src/features/brand/dto/create-brand.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBrandInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}