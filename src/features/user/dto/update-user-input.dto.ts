import { Field, InputType } from '@nestjs/graphql';
import { UserType } from '../models/user.entity';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => UserType, { defaultValue: UserType.PURCHASE, nullable: true })
  userType: UserType;
}
