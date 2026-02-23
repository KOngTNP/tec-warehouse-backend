import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Stream } from 'stream';
// { name: "", contact: "", taxId: "", branch: "", address: "", zipCode: "", remark: ""}
@InputType()
export class CreateCustomerInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  contact?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  branch?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  companyId?: string;
}