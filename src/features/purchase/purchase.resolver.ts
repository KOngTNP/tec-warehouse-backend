import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PurchaseService } from './purchase.service';
import { PaginatedPurchase, PurchaseDto, VatSummaryResponse } from './dto/purchase.dto';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import DataLoader from 'dataloader';
import { VenderDto } from '../vender/dto/vender.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { Loader } from 'nestjs-dataloader';
import { VenderLoader } from '../vender/vender.loader';
import { PurchaseItemByPurchaseLoader } from './purchase-item.loader';
import { PurchaseItemDto } from './dto/purchase-item.dto';
@Resolver(() => PurchaseDto)
export class PurchaseResolver {
  constructor(
    private purchaseService: PurchaseService,
  ) {}

  @Query(() => PaginatedPurchase, { description: 'Retrieve all purchases' })
  async getAllPurchases(
    @Args() args: PaginationArgs,
  ): Promise<PaginatedPurchase> {
    const [result, count] = await this.purchaseService.findAll(
      {
        limit: args.limit,
        offset: args.offset,
      },
    );
    // console.log('result', createPaginatedResponse<PurchaseDto>(
    //   result,
    //   count,
    //   args.limit,
    //   args.offset,
    // ));
    return createPaginatedResponse<PurchaseDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }
@Query(() => VatSummaryResponse)
async getVatTypeByVenderId(
  @Args('venderId') venderId: string,
): Promise<VatSummaryResponse> {
  const result = await this.purchaseService.findVatTypeByVenderId(venderId);
  console.log('Vat Summary Result:', result);
  return result;
}
  @ResolveField(() => [PurchaseItemDto], { nullable: true })
  async purchaseItem(
    @Parent() purchase: PurchaseDto,
    @Loader(PurchaseItemByPurchaseLoader)
    loader: DataLoader<PurchaseDto['id'], PurchaseItemDto[]>,
  ) {
    return loader.load(purchase.id).then((o) => o || []);
  }

  @ResolveField(() => VenderDto, { nullable: true })
  async vender(
    @Parent() purchase: PurchaseDto,
    @Loader(VenderLoader) loader: DataLoader<VenderDto['id'], VenderDto>,
  ): Promise<VenderDto> {
    return purchase.venderId != null ? loader.load(purchase.venderId) : null;
  }

}
