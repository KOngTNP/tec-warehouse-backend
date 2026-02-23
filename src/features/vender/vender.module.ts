import { Vender } from './models/vender.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { VenderService } from './vender.service';
import { VenderResolver } from './vender.resolver';
import { VenderLoader } from './vender.loader';
import { QuotationLog } from '../quotation/models/quotation-log.entity';
import { Purchase } from '../purchase/models/purchase.entity';
import { PurchaseService } from '../purchase/purchase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vender,QuotationLog,Purchase])],
  providers: [VenderService,
    VenderResolver,
    VenderLoader,
    PurchaseService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
    VenderResolver
  ],
  exports: [VenderService, VenderLoader],
})
export class VenderModule {}
