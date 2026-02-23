import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserStatus, UserType } from '../models/user.entity';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('User')
export class UserDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field()
  email: string;
 
  @Field(() => UserStatus)
  status: UserStatus;

  @Field({ nullable: true })
  lastLogin: Date;

  @Field(() => UserType)
  userType: UserType;

  @Field(() => Number, { nullable: true })
  loginAttempt: number;

  @Field({ nullable: true })
  attemptLifeTime: Date;


  @Field()
  createdAt: Date;


  @Field({ nullable: true })
  resetPasswordCode: string;

}

registerEnumType(UserStatus, { name: 'UserStatus' });
registerEnumType(UserType, { name: 'UserType' });

@ObjectType()
export class PaginatedUser extends Paginated(UserDto) {}
