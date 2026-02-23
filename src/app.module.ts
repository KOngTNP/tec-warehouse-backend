import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ProductModule } from './features/product/product.module';
import { CategoryModule } from './features/category/category.module';
import { FirebaseAdminCoreModule } from './features/firebase-admin/firebase-admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './config';
import * as admin from 'firebase-admin';
import { LoggerModule } from './features/logger/logger.module';
import { AuthModule } from './features/auth/auth.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { LoggerInterceptor } from './features/logger/logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import dayjs from 'dayjs';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { VenderModule } from './features/vender/vender.module';
import { CustomerModule } from './features/customer/customer.module';
import { OrderModule } from './features/order/order.module';
import { PurchaseModule } from './features/purchase/purchase.module';
import { UserModule } from './features/user/user.module';
import { UserAdminModule } from './features/user-admin/user-admin.module';
import { RemarkModule } from './features/remark/remark.module';
import { ImportScheduler } from './import.scheduler';
import { ScheduleModule } from '@nestjs/schedule'; // ✅ เพิ่มบรรทัดนี้
import { SearchModule } from './features/search/search.module';
import { QuotationModule } from './features/quotation/quotation.module';
import { EndUser } from './features/End-user/models/endUser.entity';
import { EndUserModule } from './features/End-user/endUser.module';
import { PurchasingUserModule } from './features/purchasing-user/purchasingUser.module';
import { ComparePriceModule } from './features/compare-price/compare-price.module';
import { SaleUserModule } from './features/sale-user/saleUser.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.MODE === 'production',
      load: [config],
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        timezone: 'utc',
        synchronize: false,
        bigNumberStrings: false,
        logging: false,
        poolSize: 20,
        extra: {
          charset: 'utf8mb4_unicode_ci',
          connectionLimit: 20,
          waitForConnections: true,
          queueLimit: 0,
        },
      }),
    }),
    FirebaseAdminCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        credential: admin.credential.cert(
          configService.get('serviceAccountPath'),
        ),
        databaseURL: configService.get('firebase.databaseURL'),
        storageBucket: configService.get('firebase.storageBucket'),
      }),
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    AuthModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      uploads: {
        maxFileSize: 50 * 1024 * 1024,
        maxFiles: 10,
      },
      installSubscriptionHandlers: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      introspection: true, // Always enable for codegen
      playground: false,
      sortSchema: true,
      context: ({ req, res }) => {
        return { req, res };
      },
    }),
    ProductModule,
    CategoryModule,
    CustomerModule,
    VenderModule,
    OrderModule,
    PurchaseModule,
    UserModule,
    UserAdminModule,
    RemarkModule,
    SearchModule,
    QuotationModule,
    PurchasingUserModule,
    EndUserModule,
    ComparePriceModule,
    SaleUserModule,
    ImportModule,
  ],
controllers: [AppController],
  providers: [
    ImportScheduler,
    LoggerInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    AppService,
  ],
  // providers: [AppService],
})
export class AppModule {
  constructor() {
    dayjs.locale('th');
  }
}