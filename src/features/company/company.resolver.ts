import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CompanyService } from './company.service';
import { CompanyDto, PaginatedCompany } from './dto/company.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
@Resolver(() => CompanyDto)
export class CompanyResolver {
  constructor(
    private companyService: CompanyService,
  ) {}

  
    @Query(() => PaginatedCompany, { description: 'Retrieve all companys' })
    async getAllCompanys(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedCompany> {
      const [result, count] = await this.companyService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<CompanyDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<CompanyDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
}
