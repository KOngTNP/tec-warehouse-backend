import { Quotation } from './models/quotation.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { QuotationService } from './quotation.service';
import { QuotationResolver } from './quotation.resolver';
import { QuotationItem } from './models/quotation-item.entity';
import { QuotationItemService } from './quotation-item.service';
import { QuotationLogService } from './quotation-log.service';
import { QuotationLog } from './models/quotation-log.entity';
import { QuotationItemProductService } from './quotation-item-product.service';
import { QuotationItemProduct } from './models/quotation-item-product.entity';
import { QuotationItemResolver } from './quotation-item.resolver';
import { QuotationLogResolver } from './quotation-log.resolver';
import { QuotationItemProductResolver } from './quotation-item-product.resolver';
import { QuotationLoader } from './quotation.loader';
import { ProductLoader } from '../product/product.loader';
import { ProductModule } from '../product/product.module';
import { ComparePriceLoader } from '../compare-price/compare-price.loader';
import { ComparePriceModule } from '../compare-price/compare-price.module';
import { QuotationItemByQuotationIdLoader, QuotationItemLoader } from './quotation-item.loader';
import { QuotationItemProductByQuotationItemIdLoader } from './quotation-item-product.loader';
// ... (imports อื่นๆ)
import { UserModule } from '../user/user.module'; // ✅ 1. เพิ่ม UserModule
import { UserLoaderByQuotationIdLoader } from '../user/user.loader'; // ✅ 2. เพิ่ม UserLoader

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation, 
      QuotationItem, 
      QuotationLog, 
      QuotationItemProduct
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => ComparePriceModule),
    forwardRef(() => UserModule), // ✅ 3. Import UserModule (เพื่อให้เรียกใช้ UserService ได้)
  ],
  providers: [
    QuotationResolver, 
    QuotationService, 
    QuotationItemResolver,
    QuotationItemService,
    QuotationLogResolver,
    QuotationLogService,
    QuotationItemProductResolver,
    QuotationItemProductService,
    ProductLoader,
    QuotationLoader,
    QuotationItemLoader, 
    QuotationItemByQuotationIdLoader,
    QuotationItemProductByQuotationItemIdLoader,
    ComparePriceLoader,
    UserLoaderByQuotationIdLoader, // ✅ 4. ลงทะเบียน UserLoader ที่นี่
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
  exports: [QuotationService],
})
export class QuotationModule {}