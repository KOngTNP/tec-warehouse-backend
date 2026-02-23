import { Category } from './models/category.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { CategoryLoader } from './category.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [
    CategoryService,
    CategoryResolver,
    CategoryLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [CategoryService,CategoryLoader],
})
export class CategoryModule {}
