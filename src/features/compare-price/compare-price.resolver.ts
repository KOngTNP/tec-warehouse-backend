import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { ComparePriceService } from './compare-price.service';
import { ComparePriceDto, PaginatedComparePrice } from './dto/compare-price.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateComparePriceInput } from './dto/create-compare-price.input';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { VenderDto } from '../vender/dto/vender.dto';
import { VenderLoader } from '../vender/vender.loader';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { UpdateComparePriceInput, UpdateComparePriceSequenceInput } from './dto/update-compare-price.input';
import { AuthUser } from '../auth/auth.dto';
import { CurrentUser } from 'src/shared/decorators/decorators';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { UseGuards } from '@nestjs/common';
@Resolver(() => ComparePriceDto)
export class ComparePriceResolver {
  constructor(
    private comparePriceService: ComparePriceService,
  ) {}

@Mutation(() => ComparePriceDto)
  @UseGuards(GqlAuthGuard)
async createComparePrice(
   @CurrentUser() user: AuthUser,
  @Args('input') input: CreateComparePriceInput,
): Promise<ComparePriceDto> {
  // เรียก Service เพื่อจัดการบันทึกข้อมูลและอัปโหลดรูป
  return this.comparePriceService.create(input, user);
}
  
    @Query(() => PaginatedComparePrice, { description: 'Retrieve all comparePrices' })
    async getAllComparePrices(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedComparePrice> {
      const [result, count] = await this.comparePriceService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<ComparePriceDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<ComparePriceDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
@Mutation(() => ComparePriceDto)
  @UseGuards(GqlAuthGuard)
async updateComparePrice(
     @CurrentUser() user: AuthUser,
  @Args('input') input: UpdateComparePriceInput,
): Promise<ComparePriceDto> {
  // ส่งต่อไปยัง service เพื่อจัดการ logic การแก้ไข
  const updated = await this.comparePriceService.update(input.id, input, user);
  return this.comparePriceService.findById(updated.id);
}
@Query(() => [ComparePriceDto], { name: 'getComparePriceByProductId' })
async getComparePriceByProductId(
  @Args('productId') productId: string,
): Promise<ComparePriceDto[]> {
  return this.comparePriceService.findByProductId(productId);
}
// ใน ComparePriceResolver

@Mutation(() => Boolean, { description: 'อัปเดตลำดับการแสดงผลของราคาเปรียบเทียบ' })
async updateComparePriceSequence(
  @Args('sequences', { type: () => [UpdateComparePriceSequenceInput] }) 
  sequences: UpdateComparePriceSequenceInput[],
): Promise<boolean> {
  return this.comparePriceService.updateSequence(sequences);
}


@Mutation(() => ComparePriceDto, { description: 'เลือก หรือ ยกเลิกการเลือกราคาเสนอ (Pick Price)' })
  @UseGuards(GqlAuthGuard)
async updateComparePricePickAndPoNumber(
  @Args('id') id: string,
  @Args('isPick') isPick: boolean,
  @Args('pickNote', { nullable: true }) pickNote: string,
  @Args('poNumber', { nullable: true }) poNumber: string,
       @CurrentUser() user: AuthUser,
): Promise<ComparePriceDto> {
  return this.comparePriceService.updatePickStatus(id, isPick, pickNote, poNumber, user);
}

@Mutation(() => ComparePriceDto, { description: 'เลือก หรือ ยกเลิกการเลือกราคาเสนอ (Pick Price)' })
  @UseGuards(GqlAuthGuard)
async updateComparePriceDisable(
  @Args('id') id: string,
  @Args('isDisable') isDisable: boolean,
  @Args('disableNote', { nullable: true }) disableNote: string,
  @CurrentUser() user: AuthUser,
): Promise<ComparePriceDto> {
  return this.comparePriceService.updateDisableStatus(id, isDisable, disableNote, user);
}




@Mutation(() => Boolean, { description: 'Delete compare price and its files' })
  @UseGuards(GqlAuthGuard)
async deleteComparePrice(
  @Args('id') id: string,
     @CurrentUser() user: AuthUser,
): Promise<boolean> {
  return this.comparePriceService.delete(id, user);
}
      @ResolveField(() => VenderDto, { nullable: true })
  async vender(
    @Parent() comparePrice: ComparePriceDto,
    @Loader(VenderLoader) loader: DataLoader<string, VenderDto>,
  ): Promise<VenderDto> {
    if (!comparePrice.venderId) return null;
    return loader.load(comparePrice.venderId);
  }
}
