import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { RemarkService } from './remark.service';
import { PaginatedRemark, RemarkDto } from './dto/remark.dto';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import DataLoader from 'dataloader';
import { VenderDto } from '../vender/dto/vender.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { Loader } from 'nestjs-dataloader';
import { VenderLoader } from '../vender/vender.loader';
@Resolver(() => RemarkDto)
export class RemarkResolver {
  constructor(
    private remarkService: RemarkService,
  ) {}

  // @Query(() => String)
  // async importFromDbf(): Promise<String> {
  //   return this.remarkService.importRemarkFromDbf();
  // }

}
