import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { UserDto } from '../user/dto/user.dto';
import { UserLoader } from '../user/user.loader';
import { UserAdminArgs } from './dto/user-admin.args';
import { PaginatedUserAdmin, UserAdminDto } from './dto/user-admin.dto';
import { UserAdminService } from './user-admin.service';

@Resolver(() => UserAdminDto)
export class UserAdminResolver {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Query(() => PaginatedUserAdmin)
  async userAdminPaginated(
    @Args() args: UserAdminArgs,
  ): Promise<PaginatedUserAdmin> {
    const [result, count] = await this.userAdminService.getAdminPortalUsers({
      limit: args.limit,
      offset: args.offset,
    });
    return createPaginatedResponse<UserAdminDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

  @ResolveField(() => UserDto, { nullable: true })
  async user(
    @Parent() user: UserAdminDto,
    @Loader(UserLoader.name)
    loader: DataLoader<UserDto['id'], UserDto>,
  ): Promise<UserDto> {
    return loader.load(user.userId);
  }
}
