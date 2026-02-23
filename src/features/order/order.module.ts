import { Order } from './models/order.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { CustomerModule } from '../customer/customer.module';
import { OrderByCustomerLoader } from './order.loader';
import { OrderItem } from './models/order-item.entity';
import { ProductModule } from '../product/product.module';
import { OrderItemService } from './order-item.service';
import { OrderItemResolver } from './order-item.resolver';
import { OrderItemByOrderLoader, OrderItemByProductLoader } from './order-item.loader';
import { ProductLoader } from '../product/product.loader';
import { OrderIv } from './models/order-iv.entity';
import { OrderIvResolver } from './order-iv.resolver';
import { OrderIvService } from './order-iv.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderIv]),
    forwardRef(() => ProductModule),
    forwardRef(() => CustomerModule), // ✅ import อย่างเดียวพอ
  ],
  providers: [
    OrderService,
    OrderResolver,
    OrderByCustomerLoader,
    OrderItemService,
    OrderItemResolver,
    OrderItemByOrderLoader,
    OrderItemByProductLoader,

    OrderIvService,
    OrderIvResolver,

    ProductLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
  exports: [OrderService, OrderItemService, OrderIvService],
})
export class OrderModule {}
