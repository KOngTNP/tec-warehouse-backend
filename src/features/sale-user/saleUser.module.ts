import { SaleUser } from './models/saleUser.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { SaleUserService } from './saleUser.service';
import { SaleUserResolver } from './saleUser.resolver';
import { SaleUserLoader } from './saleUser.loader';

@Module({
  imports: [TypeOrmModule.forFeature([SaleUser])],
  providers: [
    SaleUserService,
    SaleUserResolver,
    SaleUserLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [SaleUserService, SaleUserLoader],
})
export class SaleUserModule {}
