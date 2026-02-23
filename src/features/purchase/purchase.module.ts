import { Purchase } from './models/purchase.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { PurchaseService } from './purchase.service';
import { PurchaseResolver } from './purchase.resolver';
import { VenderModule } from '../vender/vender.module';
import { PurchaseByVenderLoader } from './purchase.loader';
import { PurchaseItem } from './models/purchase-item.entity';
import { ProductModule } from '../product/product.module';
import { PurchaseItemService } from './purchase-item.service';
import { PurchaseItemResolver } from './purchase-item.resolver';
import { PurchaseItemByProductLoader, PurchaseItemByPurchaseLoader } from './purchase-item.loader';
import { ProductLoader } from '../product/product.loader';
import { RemarkModule } from '../remark/remark.module';
import { RemarkService } from '../remark/remark.service';
import { RemarkResolver } from '../remark/remark.resolver';
import { PurchaseRr } from './models/purchase-rr.entity';
import { PurchaseRrResolver } from './purchase-rr.resolver';
import { PurchaseRrService } from './purchase-rr.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, PurchaseRr]), VenderModule, forwardRef(() => RemarkModule), forwardRef(() => ProductModule),],
  providers: [
    PurchaseService,
    PurchaseResolver,
    PurchaseByVenderLoader,
    PurchaseItemService,
    PurchaseItemResolver,
    PurchaseItemByProductLoader,
    PurchaseItemByPurchaseLoader,

    PurchaseRrService,
    PurchaseRrResolver,

    ProductLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [PurchaseService, PurchaseItemService, PurchaseRrService],
})
export class PurchaseModule {}
