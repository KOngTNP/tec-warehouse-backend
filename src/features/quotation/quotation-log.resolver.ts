import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { QuotationService } from './quotation.service';
import { QuotationDto, PaginatedQuotation } from './dto/quotation.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateQuotationInput } from './dto/create-quotation.args';
import { PaginatedQuotationLog, QuotationLogDto } from './dto/quotation-log.dto';
import { UseGuards } from '@nestjs/common';
import { OptionalGqlAuthGuard } from '../auth/guards/graphql-auth-optional.guard';
import { QuotationLogService } from './quotation-log.service';


@Resolver(() => QuotationLogDto)
@UseGuards(OptionalGqlAuthGuard)
export class QuotationLogResolver {
  constructor(
    private quotationLogService: QuotationLogService,
  ) {}



}
