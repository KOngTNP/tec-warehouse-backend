import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { CurrentUser } from 'src/shared/decorators/decorators';
import {
  AuthUser,
  Role,
  SignUpInput,
  SignUpSocialInput,
} from '../auth/auth.dto';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { PaginatedUser, UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { GetUserArgs } from './dto/user.args';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { RolesGuard } from '../auth/guards/role.guard';
import { UpdateUserInput } from './dto/update-user-input.dto';
import { UserType } from './models/user.entity';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [String], { nullable: 'itemsAndList' })
  async users(): Promise<string[]> {
    return ['bolt'];
  }

  @Query(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    const currentUser = await this.userService.findOneById(user.id);
    return currentUser;
  }

  @Query(() => Boolean, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async checkSessionTimeout(
    @Args('userId', { type: () => String, nullable: true }) userId: string,
    @Args('waitingAuthLogin', { type: () => Boolean, nullable: true })
    waitingAuthLogin: boolean,
  ): Promise<boolean> {
    return await this.userService.checkSessionTimeout(userId, waitingAuthLogin);
  }

  @Query(() => UserDto, { nullable: true })
  async getUserById(@Args('id') id: string): Promise<UserDto> {
    return this.userService.findOneById(id);
  }


@Query(() => [UserDto], { description: 'ดึงรายชื่อผู้ใช้ทั้งหมด (สามารถกรองตามประเภทได้)' })
async getAllUsers(
  @Args('userType', { type: () => [UserType], nullable: true }) userType?: UserType[],
): Promise<UserDto[]> {
  // ส่ง userType ไปให้ Service จัดการต่อ
  return this.userService.findAll(userType);
}

  @Mutation(() => Boolean)
  async userSignupCheck(
    @Args('email') email: string,
    @Args('mobileNo') mobileNo: string,
  ): Promise<boolean> {
    return this.userService.signupCheck(email, mobileNo);
  }

  @Mutation(() => String, { nullable: true })
  async checkSigninAttempt(@Args('email') email: string) {
    return this.userService.signinCheck(email);
  }

  @Mutation(() => String, { nullable: true })
  async createSigninAttempt(@Args('email') email: string) {
    return this.userService.addSigninAttempt(email);
  }

  @Mutation(() => Boolean, { nullable: true })
  async resetSigninAttempt(@Args('email') email: string) {
    return this.userService.resetSigninAttempt(email);
  }

  @Mutation(() => Boolean)
  async sentMailResetPassword(@Args('email') email: string) {
    return this.userService.sentMailResetPassword(email);
  }

  @Mutation(() => Boolean)
  async veriflyResetPassword(
    @Args('id') id: string,
    @Args('referenceKey') referenceKey: string,
  ) {
    return this.userService.veriflyResetPassword(id, referenceKey);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('id') id: string,
    @Args('referenceKey') referenceKey: string,
    @Args('newPassword') newPassword: string,
  ) {
    return this.userService.resetpassword(id, referenceKey, newPassword);
  }

  @Mutation(() => String)
  async getResetPasswordPublicKeyPair(): Promise<string> {
    const res = await this.userService.loadPublicKey();
    return res;
  }

  @Mutation(() => UserDto, { nullable: true })
  async signupWithEmail(@Args('signUpInput') signUpInput: SignUpInput) {
    const user = await this.userService.registerWithEmail(signUpInput);
    return user;
  }

  @Mutation(() => Boolean)
  async deleteFirebaseAccount(@Args('id') id: string) {
    const result = await this.userService.deleteFirebaseAccount(id);
    return result;
  }

  @Mutation(() => UserDto, { nullable: true })
  async signupWithGoogle(@Args('signUpSocialInput') signUpSocialInput: SignUpSocialInput) {
    return await this.userService.registerWithSocial(signUpSocialInput);
  }

  @Mutation(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @CurrentUser() user: AuthUser,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<UserDto> {
    const updatedUser = await this.userService.updateUser(
      user.id,
      updateUserInput,
    );
    return updatedUser;
  }

  @Mutation(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async signIn(@CurrentUser() user: AuthUser): Promise<boolean> {
    return this.userService.signIn(user.id);
  }


  @Mutation(() => String, {
    description: 'Request OTP to specified phone number',
  })
  async signupOtpRequest(@Args('to') to: string): Promise<string> {
    return this.userService.requestSignupOtp(to);
  }


  @Mutation(() => String)
  async createLineAuthCustomToken(
    @Args('userId', { type: () => String }) userId: string,
    @Args('customTokenKey', { type: () => String }) customTokenKey: string,
  ): Promise<string> {
    return this.userService.createLineAuthCustomToken(userId, customTokenKey);
  }


  @Query(() => PaginatedUser)
  @UseGuards(GqlAuthGuard)
  async getAllUserWithLine(
    @Args() args: PaginationArgs,
  ): Promise<PaginatedUser> {
    const [result, count] = await this.userService.findAllUserWithLine(args);
    return createPaginatedResponse<UserDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

  // @Query(() => PaginatedUser)
  // async usersPaginated(@Args() args: GetUserArgs): Promise<PaginatedUser> {
  //   const [result, count] = await this.userService.findAll(args);
  //   return createPaginatedResponse<UserDto>(
  //     result,
  //     count,
  //     args.limit,
  //     args.offset,
  //   );
  // }

  @Query(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUserByUserId(
    @Args({ name: 'id', type: () => String }) userId: string,
  ): Promise<UserDto> {
    const currentUser = await this.userService.findOneByUserId(userId);
    return currentUser;
  }

  @Query(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  @RolesGuard(Role.admin, Role.operator, Role.marketing, Role.sale)
  async getUserByEmail(
    @Args({ name: 'email', type: () => String }) email: string,
  ): Promise<UserDto> {
    const currentUser = await this.userService.findByEmail(email);
    return currentUser;
  }
}
