import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';

import { ProductService } from './product.service';
import { PaginatedProduct, ProductDto } from './dto/product.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CategoryDto } from '../category/dto/category.dto';
import { CategoryLoader } from '../category/category.loader';
import { Loader } from 'nestjs-dataloader';
import { query } from 'winston';
import { ProductGroupDto } from './dto/product-group.dto';
import { ProductGroupByChildLoader, ProductGroupByParentLoader } from './product-group.loader';
import { CreateProductInput, FileUpload } from './dto/product.input';
import { Product } from './models/product.entity';
import { GraphQLUpload } from 'graphql-upload';
import { UpdateProductInput } from './dto/update-product.input';

@Resolver(() => ProductDto)
export class ProductResolver {
  constructor(
    private productService: ProductService,
  ) {}

  @Query(() => PaginatedProduct, { description: 'Retrieve all products' })
  async getAllProducts(
    @Args() args: PaginationArgs,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('productId', { type: () => [String], nullable: true }) productId?: string[],
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<PaginatedProduct> {
    // console.log('companyId: ',companyId)
    const [result, count] = await this.productService.findAll(
      {
        limit: args.limit,
        offset: args.offset,
        query: query,
        productId: productId,
        companyId,
      },
    );
    // console.log('result', createPaginatedResponse<ProductDto>(
    //   result,
    //   count,
    //   args.limit,
    //   args.offset,
    // ));
    return createPaginatedResponse<ProductDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

  @Query(() => [ProductDto])
  async getProductsByIds(
    @Args('productIds', { type: () => [String], nullable:true }) productIds: string[],
  ): Promise<ProductDto[]> {
    return this.productService.findByIds(productIds);
  }

@Mutation(() => ProductDto) // หรือเปลี่ยนเป็น @Mutation ถ้าเป็นการสร้างข้อมูลใหม่
async createTempProduct(
  @Args('input') input: CreateProductInput, // ✅ รับข้อมูลผ่าน input object
): Promise<ProductDto> {
  return this.productService.createTempProduct(input);
}

@Mutation(() => ProductDto) // 👈 เปลี่ยนจาก Product เป็น ProductDto
async updateProduct(
  @Args('input') input: UpdateProductInput,
  @Args({ name: 'imageFiles', type: () => [GraphQLUpload], nullable: true })
  imageFiles?: Promise<FileUpload>[],
  @Args({ name: 'videoFiles', type: () => [GraphQLUpload], nullable: true })
  videoFiles?: Promise<FileUpload>[],
  @Args({ name: 'dataSheetFiles', type: () => [GraphQLUpload], nullable: true })
  dataSheetFiles?: Promise<FileUpload>[],
): Promise<ProductDto> { // 👈 เปลี่ยนเป็น ProductDto ด้วย
  
  const updateInput = {
    ...input,
    imageFiles: imageFiles || [],
    videoFiles: videoFiles || [],
    dataSheetFiles: dataSheetFiles || [],
  };

  // เรียกใช้ Service
  const updatedProduct = await this.productService.updateProduct(input.id, updateInput);
  
  // ⚠️ สำคัญ: ต้องทำการ Map กลับเป็น DTO ก่อนส่งออกไป
  return this.productService.findById(updatedProduct.id); 
}

  // ✅ Mutation: เพิ่มรูปเข้า product (push ทีละรูป)
  @Mutation(() => ProductDto, {
    description: 'Add image to product by product ID',
  })
  async addProductImageById(
    @Args('productId') productId: string,
    @Args('imageUrl') imageUrl: string,
  ): Promise<ProductDto> {
    return this.productService.addProductImageById(productId, imageUrl);
  }

  // ✅ Mutation: ลบรูปออกจาก product (ลบตาม URL)
  @Mutation(() => ProductDto, {
    description: 'Remove image from product by product ID',
  })
  async removeProductImageById(
    @Args('productId') productId: string,
    @Args('imageUrl') imageUrl: string,
  ): Promise<ProductDto> {
    return this.productService.removeProductImageById(productId, imageUrl);
  }

  

  @Query(() => ProductDto, { description: 'Retrieve a product by ID' })
  async getProductById(
    @Args('id') id: string,
  ): Promise<ProductDto> {
    return this.productService.findById(id);
  }
  @Mutation(() => Boolean, { nullable: true })
  async createProductSearchFile(
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ) {
    // console.log('companyId: ',companyId)
    return this.productService.createProductSearchFile(companyId);
  }

  @ResolveField(() => CategoryDto, { nullable: true })
  async category(
    @Parent() product: ProductDto,
    @Loader(CategoryLoader) loader: DataLoader<CategoryDto['id'], CategoryDto>,
  ): Promise<CategoryDto> {
    return product.categoryId != null ? loader.load(product.categoryId) : null;
  }

   @ResolveField(() => [ProductGroupDto], { nullable: true })
  async parentGroups(
    @Parent() product: ProductDto,
    @Loader(ProductGroupByParentLoader) loader: DataLoader<ProductGroupDto['id'], ProductGroupDto[]>,
  ): Promise<ProductGroupDto[]> {
    return loader.load(product.id);
  }



     @ResolveField(() => [ProductGroupDto], { nullable: true })
  async childGroups(
    @Parent() product: ProductDto,
    @Loader(ProductGroupByChildLoader) loader: DataLoader<ProductGroupDto['id'], ProductGroupDto[]>,
  ): Promise<ProductGroupDto[]> {
    return loader.load(product.id);
  }

}
