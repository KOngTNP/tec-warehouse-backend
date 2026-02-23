import { Module } from '@nestjs/common';
import { ImportResolver } from './import.resolver';
import { ImportService } from './import.service';
import { ImportScheduler } from '../import.scheduler';
import { CategoryModule } from '../features/category/category.module';
import { ProductModule } from '../features/product/product.module';
import { CustomerModule } from '../features/customer/customer.module';
import { VenderModule } from '../features/vender/vender.module';
import { OrderModule } from '../features/order/order.module';
import { PurchaseModule } from '../features/purchase/purchase.module';
import { RemarkModule } from '../features/remark/remark.module';

@Module({
  imports: [
    CategoryModule,
    ProductModule,
    CustomerModule,
    VenderModule,
    OrderModule,
    PurchaseModule,
    RemarkModule,
  ],
  providers: [ImportResolver, ImportService, ImportScheduler],
  exports: [ImportService, ImportScheduler],
})
export class ImportModule {}
