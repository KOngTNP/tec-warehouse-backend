import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateProductInput } from "./product.input";

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  id: string;

  // รายการ URL เดิมที่ผู้ใช้ยัง "คงไว้" (ไม่กดลบ)
  @Field(() => [String], { nullable: true })
  existingImages?: string[];

  @Field(() => [String], { nullable: true })
  existingVideos?: string[];

  @Field(() => [String], { nullable: true })
  existingSheets?: string[];
}