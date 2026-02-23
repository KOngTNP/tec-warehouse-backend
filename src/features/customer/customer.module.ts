import { Customer } from './models/customer.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { CustomerService } from './customer.service';
import { CustomerResolver } from './customer.resolver';
import { OrderModule } from '../order/order.module';
import { CustomerLoader } from './customer.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [
    CustomerService,
    CustomerResolver,
    CustomerLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [CustomerService, CustomerLoader],
})
export class CustomerModule {}
