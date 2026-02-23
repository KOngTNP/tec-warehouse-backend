import { ComparePrice } from './models/compare-price.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { ComparePriceService } from './compare-price.service';
import { ComparePriceResolver } from './compare-price.resolver';
import { ComparePriceLoader } from './compare-price.loader';
import { QuotationLog } from '../quotation/models/quotation-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComparePrice, QuotationLog])],
  providers: [
    ComparePriceService,
    ComparePriceResolver,
    ComparePriceLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [ComparePriceService],
})
export class ComparePriceModule {}
