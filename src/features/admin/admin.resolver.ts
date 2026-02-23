import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Role } from '../auth/auth.dto';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { UserDto } from '../user/dto/user.dto';
import { AdminService } from './admin.service';
import { GrantAdminInput } from './dto/grant-admin-input.dto';

@Resolver(() => UserDto)
@UseGuards(GqlAuthGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Mutation(() => UserDto, { nullable: true })
  @RolesGuard(Role.admin)
  async grantAdmin(@Args('grantAdminInput') grantAdminInput: GrantAdminInput) {
    await this.adminService.grantAdmin(grantAdminInput);
  }

  @Mutation(() => UserDto, { nullable: true })
  @RolesGuard(Role.admin)
  async revokeAdmin(@Args('grantAdminInput') grantAdminInput: GrantAdminInput) {
    await this.adminService.revokeAdmin(grantAdminInput);
  }

  @Mutation(() => UserDto, { nullable: true })
  @RolesGuard(Role.admin)
  async grantAdminByEmail(
    @Args('email') email: string,
    @Args('role') role: string,
  ) {
    await this.adminService.grantAdminByEmail(email, role);
  }

  @Mutation(() => UserDto, { nullable: true })
  @RolesGuard(Role.admin)
  async revokeAdminByEmail(@Args('email') email: string): Promise<void> {
    await this.adminService.revokeAdminByEmail(email);
  }
}
