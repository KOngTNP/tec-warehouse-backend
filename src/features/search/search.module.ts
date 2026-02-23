import { Module, forwardRef } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchResolver } from './search.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { ProductModule } from '../product/product.module';
import { VenderModule } from '../vender/vender.module';
import { CustomerModule } from '../customer/customer.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    forwardRef(() => OrderModule),
    forwardRef(() => PurchaseModule),
    forwardRef(() => VenderModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => ProductModule),
  ],
  providers: [SearchService, SearchResolver],
  exports: [SearchService],
})
export class SearchModule {}