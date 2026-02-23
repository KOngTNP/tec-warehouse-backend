import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateSaleUserInput } from './create-end-user.input';

@InputType()
export class UpdateSaleUserInput extends PartialType(CreateSaleUserInput) {
  @Field()
  id: string; // บังคับส่ง ID มาเพื่อเช็คว่าจะแก้คนไหน
}