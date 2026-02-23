import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CategoryService } from './category.service';
import { CategoryDto, PaginatedCategory } from './dto/category.dto';
import { ProductDto } from '../product/dto/product.dto';
import { ProductByCategoryLoader } from '../product/product.loader';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
@Resolver(() => CategoryDto)
export class CategoryResolver {
  constructor(
    private categoryService: CategoryService,
  ) {}

  
  @ResolveField(() => [ProductDto], { nullable: true })
  async products(
    @Parent() category: CategoryDto,
    @Loader(ProductByCategoryLoader)
    loader: DataLoader<ProductDto['id'], ProductDto[]>,
  ): Promise<ProductDto[]> {
    const result = await loader.load(category.id).then((o) => o || []);
    return result;
  }

    @Query(() => PaginatedCategory, { description: 'Retrieve all categorys' })
    async getAllCategorys(
      @Args() args: PaginationArgs,
      @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
    ): Promise<PaginatedCategory> {
      const [result, count] = await this.categoryService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
          companyId,
        },
      );
      // console.log('result', createPaginatedResponse<CategoryDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<CategoryDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
}
