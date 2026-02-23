import { Field, InputType } from '@nestjs/graphql';
import { UserType } from '../user/models/user.entity';

@InputType()
export class SignUpInput {
  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => UserType, { nullable: true })
  userType: UserType;


}

@InputType()
export class SignUpSocialInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field()
  email: string;

  @Field(() => String)
  mobileNo: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string;

  @Field()
  consent: boolean;

  @Field()
  opinionConsent: boolean;

  @Field()
  serviceConsent: boolean;

  @Field()
  pdpaConsent: boolean;

  @Field()
  tecConsent: boolean;

  @Field()
  news: boolean;

  @Field()
  sellerSharingConsent: boolean;

  @Field()
  installerSharingConsent: boolean;

  @Field()
  deliverySharingConsent: boolean;

  @Field(() => UserType, { nullable: true })
  userType: UserType;

  @Field(() => String, { nullable: true })
  referrerCode: string;

  @Field(() => String, { nullable: true })
  lineId: string;
}

/**
 * Represent authenticated user in the request.
 */
export class AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export enum Role {
  admin = 'admin',
  operator = 'operator',
  marketing = 'marketing',
  sale = 'sale',
}

export enum StoreRole {
  admin = 'admin',
  accountant = 'accountant',
  operator = 'operator',
  seller = 'seller',
  marketing = 'marketing',
}

export const allStoreRole = [
  StoreRole.admin,
  StoreRole.accountant,
  StoreRole.operator,
  StoreRole.seller,
  StoreRole.marketing,
];

/**
 * Represent authenticated seller from JWT token
 */
export class AuthSellerJWT {
  storeId: string;
  name: string;
}
