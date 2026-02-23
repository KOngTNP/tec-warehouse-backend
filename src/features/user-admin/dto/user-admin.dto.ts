import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('UserAdmin')
export class UserAdminDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  role: string;

  @Field()
  createdAt: Date;

  @Field()
  modifiedAt: Date;
}

@ObjectType()
export class PaginatedUserAdmin extends Paginated(UserAdminDto) {}
