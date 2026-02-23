import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CreateQuotationItemProductInput } from './dto/create-quotation-item-product.args';
import { QuotationItemProductDto } from './dto/quotation-item-product.dto';
import { QuotationItemProductService } from './quotation-item-product.service';
import { ProductDto } from '../product/dto/product.dto';
import { ProductService } from '../product/product.service';
import DataLoader from 'dataloader';
import { ProductLoader } from '../product/product.loader';
import { Loader } from 'nestjs-dataloader';
import { ComparePriceDto } from '../compare-price/dto/compare-price.dto';
import { ComparePriceLoader } from '../compare-price/compare-price.loader';
import { UpdateQuotationItemProductSequenceInput } from './dto/update-quotation-input';
import { CurrentUser } from 'src/shared/decorators/decorators';
import { AuthUser } from '../auth/auth.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';

@Resolver(() => QuotationItemProductDto)
export class QuotationItemProductResolver {
  constructor(
    private quotationItemProductService: QuotationItemProductService,
  ) {}

  @Mutation(() => QuotationItemProductDto)
    @UseGuards(GqlAuthGuard)
  async createQuotationItemProduct(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateQuotationItemProductInput,
    // ✅ รับไฟล์รูปภาพแยก (กรณีพี่อัปโหลดรูปหน้างานเพิ่มในขั้นตอนนี้)
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) 
    files?: Promise<FileUpload>[],
  ): Promise<QuotationItemProductDto> {
    return this.quotationItemProductService.create(input, user, files);
  }
  
  @Mutation(() => Boolean, { description: 'อัปเดตลำดับการแสดงผลของQuotationItemProduct' })
  async updateQuotationItemProductSequence(
    @Args('sequences', { type: () => [UpdateQuotationItemProductSequenceInput] }) 
    sequences: UpdateQuotationItemProductSequenceInput[],
  ): Promise<boolean> {
    return this.quotationItemProductService.updateSequence(sequences);
  }


  @Mutation(() => Boolean, { name: 'deleteQuotationItemProduct' })
    @UseGuards(GqlAuthGuard)
  async deleteQuotationItemProduct(
        @CurrentUser() user: AuthUser,
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<boolean> {
    return this.quotationItemProductService.delete(id, user);
  }

  @Query(() => [QuotationItemProductDto], { name: 'getQuotationItemProductByQuotationItemId' })
  async getQuotationItemProductByQuotationItemId(
    @Args('quotationItemId') quotationItemId: string,
  ): Promise<QuotationItemProductDto[]> {
    return this.quotationItemProductService.findByQuotationItemId(quotationItemId);
  }

   @ResolveField(() => ProductDto, { nullable: true })
   async product(
     @Parent() quotationItemId: QuotationItemProductDto,
     @Loader(ProductLoader) loader: DataLoader<ProductDto['id'], ProductDto>,
   ): Promise<ProductDto> {
     return quotationItemId.productId != null ? loader.load(quotationItemId.productId) : null;
   }

@ResolveField(() => [ComparePriceDto], { 
  name: 'comparePrices', // ✅ บังคับชื่อฟิลด์ให้ตรงกับที่หน้าบ้านเรียก
  nullable: true 
})
async comparePrices( // ✅ แก้ชื่อฟิลด์เป็นพหูพจน์ตามหน้าบ้าน
  @Parent() qip: QuotationItemProductDto,
  @Loader(ComparePriceLoader)
  loader: DataLoader<string, ComparePriceDto[]>,
): Promise<ComparePriceDto[]> {
  // console.log('Loading ComparePrice for QIP ID:', qip.id); // ลอง log ดูว่า function นี้ทำงานไหม
  if (!qip.id) return [];
  return loader.load(qip.id);
}

   
 @Mutation(() => QuotationItemProductDto, { description: 'แก้ไขหมายเหตุสินค้าจัดซื้อ' })
   @UseGuards(GqlAuthGuard)
async updateQuotationItemProductNote(
      @CurrentUser() user: AuthUser,
  @Args('id') id: string,
  @Args('note') note: string,
): Promise<QuotationItemProductDto> {
  return this.quotationItemProductService.updateNote(id, note, user);
}
  @Mutation(() => QuotationItemProductDto)
async uploadQuotationItemProductWorkSheetImages(
  @Args({ name: 'quotationItemProductId', type: () => String }) quotationItemProductId: string,
  @Args({ name: 'files', type: () => [GraphQLUpload] }) files: Promise<FileUpload>[],
): Promise<QuotationItemProductDto> {
  return this.quotationItemProductService.uploadWorkSheetImages(quotationItemProductId, files);
}


}