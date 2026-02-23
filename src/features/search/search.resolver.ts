
import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { SearchService } from './search.service';
import { SearchVenderResult } from './dto/search.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';

@Resolver()
export class SearchResolver {
  constructor(
    private searchService: SearchService,
  ) {}


@Query(() => [SearchVenderResult])
async searchBestVenders(
  @Args('keyword') keyword: string,
): Promise<SearchVenderResult[]> {
  const result = await this.searchService.searchBestVenders(keyword);

  // 🔥 convert RowDataPacket → SearchVenderResult

  return result.map((row: any) => ({
    id: row.vender_id ?? '',
    venderName: row.venderName ?? '',
    venderTel: row.venderTel ?? '',
    purchaseCount: Number(row.purchaseCount) ?? 0,
    productName: row.productName ?? '',
    purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : null,
    discount: row.discount ?? '',
    totalRelevance: Number(row.totalRelevance) ?? 0,
  }));
}

@Query(() => [String])
async getTopKeywordsByVendor(
  @Args('venderId') venderId: string,
): Promise<string[]> {
  const result = await this.searchService.getTopKeywordsByVendor(venderId);
  // console.log('Top Keywords Result:', result);
  return result;
}

@Query(() => [String])
async getTopKeywordsByCustomer(
  @Args('customerId') customerId: string,
): Promise<string[]> {
  const result = await this.searchService.getTopKeywordsByCustomer(customerId);
  // console.log('Top Keywords Result:', result);
  return result;
}

}
