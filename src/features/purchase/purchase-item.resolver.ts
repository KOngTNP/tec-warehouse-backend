import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PurchaseItemService } from './purchase-item.service';
import { PaginatedPurchaseItem, PurchaseItemDto, PurchaseItemSummaryDto } from './dto/purchase-item.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { Loader } from 'nestjs-dataloader';
import { ProductLoader } from '../product/product.loader';
@Resolver(() => PurchaseItemDto)
export class PurchaseItemResolver {
  constructor(
    private purchaseItemService: PurchaseItemService,
  ) {}

    @Query(() => PaginatedPurchaseItem, { description: 'Retrieve all purchaseItems' })
    async getAllPurchaseItems(
      @Args() args: PaginationArgs,
      @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
    ): Promise<PaginatedPurchaseItem> {
      const [result, count] = await this.purchaseItemService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
          companyId: companyId,
        },
      );
      // console.log('result', createPaginatedResponse<PurchaseItemDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<PurchaseItemDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }

  @Query(() => [PurchaseItemDto])
  async getPurchaseItemsByProductId(
    @Args('productId') productId: string,
    @Args('sortField', { type: () => String, nullable: true }) sortField?: string,
    @Args('sortOrder', { type: () => String, nullable: true }) sortOrder?: 'ASC' | 'DESC',
  ): Promise<PurchaseItemDto[]> {
    const items = await this.purchaseItemService.findByProductId(
      productId,
      sortField,
      sortOrder,
    );
    return items;
  }

@Query(() => [PurchaseItemDto])
async getPurchaseItemsByVenderId(
  @Args('venderId') venderId: string,
  @Args('sortField', { type: () => String, nullable: true }) sortField?: string,
  @Args('sortOrder', { type: () => String, nullable: true }) sortOrder?: 'ASC' | 'DESC',
  // @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  // @Args('offset', { type: () => Int, nullable: true }) offset?: number,
): Promise<PurchaseItemDto[]> {
  const result = await this.purchaseItemService.findByVenderId(
    venderId,
    sortField,
    sortOrder,
    // limit,
    // offset,
  );
  // console.log('result', result.length);
  return result
}


    @Query(() => [PurchaseItemDto])
    async getPurchaseItemsByPurchaseId(
      @Args('purchaseId') purchaseId: string,  
    ): Promise<PurchaseItemDto[]> { 
      return await this.purchaseItemService.findAllByPurchaseId(purchaseId)
    }


      @Query(() => PurchaseItemSummaryDto, { description: 'Get purchase item summary by product ID' })
      async getPurchaseItemSummaryByProductId(
        @Args('productId') productId: string,
      ): Promise<PurchaseItemSummaryDto> {
        // console.log('Fetching purchase item summary for productId:', productId);
        // console.log('PurchaseItemService instance:', await this.purchaseItemService.sumOverallByProductId(productId));
        return await this.purchaseItemService.sumOverallByProductId(productId);
      }
    @ResolveField(() => ProductDto, { nullable: true })
    async product(
      @Parent() purchaseItem: PurchaseItemDto,
      @Loader(ProductLoader) loader: DataLoader<ProductDto['id'], ProductDto>,
    ): Promise<ProductDto> {
      return purchaseItem.productId != null ? loader.load(purchaseItem.productId) : null;
    }
  
  }
  