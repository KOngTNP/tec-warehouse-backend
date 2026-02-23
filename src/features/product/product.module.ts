import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { Product } from './models/product.entity';
import { ProductGroup } from './models/product-group.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { ProductByBrandLoader, ProductByCategoryLoader, ProductLoader } from './product.loader';
import { ProductGroupService } from './product-group.service';
import { ProductGroupByChildLoader } from './product-group.loader';
import { ProductGroupByParentLoader } from './product-group.loader';
import { CategoryModule } from '../category/category.module';
import { OrderModule } from '../order/order.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { ProductGroupResolver } from './product-group.resolver';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductGroup]),
    CategoryModule,
    BrandModule,
    forwardRef(() => OrderModule),
    forwardRef(() => PurchaseModule),
  ],
  providers: [
    ProductService,
    ProductGroupService,
    ProductResolver,
    ProductGroupResolver,
    ProductByCategoryLoader,
    ProductByBrandLoader,
    ProductLoader,
    ProductGroupByChildLoader,
    ProductGroupByParentLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor, // ให้ DataLoaderInterceptor ทำงาน
    },
  ],
  exports: [ProductService, ProductGroupService],
})
export class ProductModule {}
