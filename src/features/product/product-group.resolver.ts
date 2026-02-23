import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { ProductGroupDto } from './dto/product-group.dto';
import { ProductDto } from './dto/product.dto';
import { ProductLoader } from './product.loader';

@Resolver(() => ProductGroupDto)
export class ProductGroupResolver {
  @ResolveField(() => ProductDto, { nullable: true })
  async parentProduct(
    @Parent() group: ProductGroupDto,
    @Loader(ProductLoader) loader: DataLoader<ProductDto['id'], ProductDto>,
    ): Promise<ProductDto> {
        // console.log('parentProductId:', group.parentProductId);
    return group.parentProductId != null ? loader.load(group.parentProductId) : null;
    }

  @ResolveField(() => ProductDto, { nullable: true })
  async childProduct(
    @Parent() group: ProductGroupDto,
    @Loader(ProductLoader) loader: DataLoader<ProductDto['id'], ProductDto>,
    ): Promise<ProductDto> {
        // console.log('parentProductId:', group.childProductId);
    return group.childProductId != null ? loader.load(group.childProductId) : null;
    }
}
