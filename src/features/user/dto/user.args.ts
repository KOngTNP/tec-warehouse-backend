import {
  ArgsType,
  Field,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserStatus, UserType } from '../models/user.entity';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';

@ArgsType()
export class GetUserArgs extends PaginationArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => UserStatus, { nullable: true, defaultValue: null })
  status?: UserStatus;

  @Field(() => UserType, { nullable: true, defaultValue: null })
  userType?: UserType;

  @Field(() => Date, { nullable: true, defaultValue: null })
  lastLoginfromDate: Date;

  @Field(() => Date, { nullable: true, defaultValue: null })
  lastLogintoDate: Date;

  @Field(() => Date, { nullable: true, defaultValue: null })
  createdAtfromDate: Date;

  @Field(() => Date, { nullable: true, defaultValue: null })
  createdAttoDate: Date;
}
