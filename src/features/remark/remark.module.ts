import { Remark } from './models/remark.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { RemarkService } from './remark.service';
import { RemarkResolver } from './remark.resolver';
import { PurchaseModule } from '../purchase/purchase.module';
// import { RemarkByVenderLoader } from './remark.loader';
// import { ProductModule } from '../product/product.module';
// import { ProductLoader } from '../product/product.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Remark]),forwardRef(() => PurchaseModule),],
  providers: [
    RemarkService,
    RemarkResolver,
    // RemarkByVenderLoader,
    // ProductLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [RemarkService],
})
export class RemarkModule {}
