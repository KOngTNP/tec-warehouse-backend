import { InputType, Field, Float } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { QuotationStatus } from './quotation.dto';
import { GraphQLScalarType } from 'graphql';
// import { GraphQLJSON } from 'graphql-scalars';
const AnyHybridQuotation = new GraphQLScalarType({
  name: 'AnyHybridQuotation',
  description: 'ยอมรับทั้ง String URL และ File Upload',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast: any) => ast.value,
});

@InputType()
export class QuotationItemInput {
  @Field({ nullable: true }) id: string;
  @Field() customerSpec: string;
  @Field({ nullable: true }) globalName: string;
  @Field({ nullable: true }) oldRefDoc: string;
  @Field(() => Float) qty: number;
  @Field() unit: string;
  @Field(() => Float) pricePerUnit: number;
  @Field({ nullable: true }) note: string
  @Field() isHidden: boolean
  @Field() isObsolete: boolean
  @Field({ nullable: true }) productLink: string;
  @Field({ nullable: true }) inSiderNote: string;
  
  // ✅ ไฟล์รูปภาพเฉพาะ Item นี้
@Field(() => [AnyHybridQuotation], { nullable: 'itemsAndList' }) 
  images?: any[];
}

@InputType()
export class CreateQuotationInput {
  @Field() quotationNumber: string;
  @Field({ nullable: true }) companyId: string;
  @Field({ nullable: true }) customerId: string;
  @Field({ nullable: true }) purchasingUserId: string;
  @Field({ nullable: true }) contact: string;
  @Field({ nullable: true }) endUserId: string;
  @Field({ nullable: true }) documentNumber: string;
  @Field({ nullable: true }) email: string;
  @Field({ nullable: true }) deliveryDueDate: string;
  @Field({ nullable: true }) priceValidUntil: string;
  @Field({ nullable: true }) paymentTerm: string;
  @Field({ nullable: true }) quotedBy: string;
  @Field({ nullable: true }) quotedDate: Date;
  @Field({ nullable: true }) priceApprovedBy: string;
  @Field({ nullable: true }) leadChannel: string;
  @Field({ nullable: true }) leadReceivedDate: Date;
  @Field({ nullable: true }) referenceLink: string;
  @Field({ nullable: true }) reference: string;
  @Field({ nullable: true }) salesUser: string;
  @Field({ nullable: true }) inSiderNote: string;
  @Field({ nullable: true }) status: QuotationStatus
  @Field({ nullable: true }) expirationDate: Date;
  @Field({ nullable: true }) note: string;
    @Field({ nullable: true }) userId: string;
  // ✅ ไฟล์รูปภาพส่วนหัว (Header)
  @Field(() => [AnyHybridQuotation], { nullable: 'itemsAndList' }) 
  quotationImages?: any[];

    @Field(() => [AnyHybridQuotation], { nullable: 'itemsAndList' }) 
  quotationDocuments?: any[];

      @Field(() => [AnyHybridQuotation], { nullable: 'itemsAndList' }) 
  inSiderFile?: any[];

  @Field(() => [QuotationItemInput]) 
  items: QuotationItemInput[];
}