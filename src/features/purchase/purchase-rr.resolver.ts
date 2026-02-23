import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PurchaseRrService } from './purchase-rr.service';
import { PaginatedPurchaseRr, PurchaseRrDto } from './dto/purchase-rr.dto';
@Resolver(() => PurchaseRrDto)
export class PurchaseRrResolver {
  constructor(
    private purchaseRrService: PurchaseRrService,
  ) {}
  @Query(() => [PurchaseRrDto])
  async getPurchaseRrsByPurchaseIdAndProductId(
    @Args('purchaseId') purchaseId: string,
    @Args('productId') productId: string,
  ): Promise<PurchaseRrDto[]> {
    const items = await this.purchaseRrService.findByPurchaseIdAndProductId(
      purchaseId,
      productId,
    );
    return items;
  }

  @Query(() => [PurchaseRrDto])
  async getPurchaseRrsByPurchaseId(
    @Args('purchaseId') purchaseId: string,
  ): Promise<PurchaseRrDto[]> {
    const items = await this.purchaseRrService.findByPurchaseId(
      purchaseId,
    );
    return items;
  } 

    @Query(() => [PurchaseRrDto])
  async getPurchaseRrsByDocumentNumber(
    @Args('documentNumber') documentNumber: string,
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<PurchaseRrDto[]> {
    const items = await this.purchaseRrService.findByDocumentNumber(
      documentNumber,
      companyId,
    );
    return items;
  } 
}
