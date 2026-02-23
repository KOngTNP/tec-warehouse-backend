import { PurchasingUser } from './models/purchasingUser.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { PurchasingUserService } from './purchasingUser.service';
import { PurchasingUserResolver } from './purchasingUser.resolver';
import { PurchasingUserLoader } from './purchasingUser.loader';

@Module({
  imports: [TypeOrmModule.forFeature([PurchasingUser])],
  providers: [
    PurchasingUserService,
    PurchasingUserResolver,
    PurchasingUserLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [PurchasingUserService, PurchasingUserLoader],
})
export class PurchasingUserModule {}
