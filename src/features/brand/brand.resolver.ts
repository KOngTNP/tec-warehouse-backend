import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { BrandService } from './brand.service';
import { BrandDto, PaginatedBrand } from './dto/brand.dto';
import { ProductDto } from '../product/dto/product.dto';
import { ProductByBrandLoader } from '../product/product.loader';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateBrandInput } from './dto/create-brand.input';
@Resolver(() => BrandDto)
export class BrandResolver {
  constructor(
    private brandService: BrandService,
  ) {}

  
  @ResolveField(() => [ProductDto], { nullable: true })
  async products(
    @Parent() brand: BrandDto,
    @Loader(ProductByBrandLoader)
    loader: DataLoader<ProductDto['id'], ProductDto[]>,
  ): Promise<ProductDto[]> {
    const result = await loader.load(brand.id).then((o) => o || []);
    return result;
  }


  
  @Mutation(() => BrandDto, { description: 'Create a new brand' })
  async createBrand(
    @Args('input') input: CreateBrandInput,
  ): Promise<BrandDto> {
    return await this.brandService.create(input);
  }

    @Query(() => PaginatedBrand, { description: 'Retrieve all brands' })
    async getAllBrands(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedBrand> {
      const [result, count] = await this.brandService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<BrandDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<BrandDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
}
