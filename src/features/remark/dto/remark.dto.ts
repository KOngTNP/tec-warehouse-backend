import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from 'src/shared/pagination/pagination.type';

@ObjectType('Remark')
export class RemarkDto {
  @Field()
  id: string;

  @Field()
  documentNumber: string;

  @Field()
  seqNumber: string;

  @Field(() => String, { nullable: true })
  remark: string;
}


@ObjectType()
export class PaginatedRemark extends Paginated(RemarkDto) {}
