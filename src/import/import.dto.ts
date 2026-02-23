import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ImportResultDto {
  @Field(() => String)
  status: 'success' | 'error';

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  startTime?: string;

  @Field(() => String, { nullable: true })
  endTime?: string;

  @Field(() => String, { nullable: true })
  duration?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}
