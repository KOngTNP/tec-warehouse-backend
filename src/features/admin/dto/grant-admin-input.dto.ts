import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GrantAdminInput {
  @Field()
  userId?: string;

  @Field()
  key?: string;

  @Field()
  role?: string;
}
