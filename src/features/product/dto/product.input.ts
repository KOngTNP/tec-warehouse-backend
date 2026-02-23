import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { Stream } from 'stream';

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  ExCode?: string;

  @Field()
  partstore: string;

  @Field()
  unit: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  detail?: string;

  @Field(() => Boolean, { defaultValue: false })
  isGroup: boolean;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  brandId?: string;

  @Field(() => ID, { nullable: true })
  companyId?: string;

  // ✅ รับไฟล์รูปภาพเพื่อนำไป Upload เข้า Storage
  @Field(() => [GraphQLUpload], { nullable: true })
  videoFiles?: Promise<FileUpload>[];

    @Field(() => [GraphQLUpload], { nullable: true })
  dataSheetFiles?: Promise<FileUpload>[];

    @Field(() => [GraphQLUpload], { nullable: true })
  imageFiles?: Promise<FileUpload>[];
}

// Interface สำหรับจัดการ Stream ของไฟล์
export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}