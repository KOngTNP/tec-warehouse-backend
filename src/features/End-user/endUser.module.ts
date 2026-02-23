import { EndUser } from './models/endUser.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader'
import { EndUserService } from './endUser.service';
import { EndUserResolver } from './endUser.resolver';
import { EndUserLoader } from './endUser.loader';

@Module({
  imports: [TypeOrmModule.forFeature([EndUser])],
  providers: [
    EndUserService,
    EndUserResolver,
    EndUserLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,  // Ensure this interceptor is globally applied
    },
  ],
  exports: [EndUserService, EndUserLoader],
})
export class EndUserModule {}
