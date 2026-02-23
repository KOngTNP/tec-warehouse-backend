
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { QuotationItemDto } from './dto/quotation-item.dto';
import { OptionalGqlAuthGuard } from '../auth/guards/graphql-auth-optional.guard';
import { UseGuards } from '@nestjs/common';
import { QuotationItemService } from './quotation-item.service';
import { QuotationItemProductDto } from './dto/quotation-item-product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { QuotationItemProductByQuotationItemIdLoader } from './quotation-item-product.loader';
import { CurrentUser } from 'src/shared/decorators/decorators';
import { AuthUser } from '../auth/auth.dto';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';

@Resolver(() => QuotationItemDto)
export class QuotationItemResolver {
  constructor(
    private quotationItemService: QuotationItemService,
  ) {}

@Query(() => [QuotationItemDto])
  async getQuotationItemByQuotationId(
    @Args('quotationId') quotationId: string,
  ): Promise<QuotationItemDto[]> {
    // ดึงรายการ Product Components ที่อยู่ในชุดนี้
    return this.quotationItemService.findByQuotationId(quotationId);
  }
  
@Mutation(() => QuotationItemDto, { description: 'แก้ไขหมายเหตุภายใน (Insider Note)' })
  @UseGuards(GqlAuthGuard)
async updateQuotationItemInsiderNote(
  @CurrentUser() user: AuthUser,
  @Args('id') id: string,
  @Args('inSiderNote') inSiderNote: string,
): Promise<QuotationItemDto> {
  return this.quotationItemService.updateInsiderNote(id, inSiderNote, user);
}

@Mutation(() => QuotationItemDto, { description: 'แก้ไขราคาต่อหน่วย' })
  @UseGuards(GqlAuthGuard)
async updateQuotationItemUnitPrice(
  @CurrentUser() user: AuthUser,
  @Args('id') id: string,
  @Args('unitPrice') unitPrice: number,
): Promise<QuotationItemDto> {
  return this.quotationItemService.updateUnitPrice(id, unitPrice, user);
}

@ResolveField(() => [QuotationItemProductDto], { nullable: true })
async quotationItemProduct(
  @Parent() quotationItem: QuotationItemDto,
  @Loader(QuotationItemProductByQuotationItemIdLoader) 
  loader: DataLoader<string, QuotationItemProductDto[]>, 
): Promise<QuotationItemProductDto[]> {
  // ไม่ต้องใช้ as any ถ้า Type ใน loader ถูกต้อง
  return loader.load(quotationItem.id).then((o) => o || []);
}

}
