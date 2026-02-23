import { Brand } from './models/brand.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { BrandService } from './brand.service';
import { BrandResolver } from './brand.resolver';
import { BrandLoader } from './brand.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  providers: [
    BrandService,
    BrandResolver,
    BrandLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [BrandService,BrandLoader],
})
export class BrandModule {}
