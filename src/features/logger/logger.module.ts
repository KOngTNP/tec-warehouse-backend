import { Module } from '@nestjs/common';
import { DefaultLogger } from './default-logger';
import { LoggerInterceptor } from './logger.interceptor';

@Module({
  providers: [DefaultLogger, LoggerInterceptor],
  exports: [DefaultLogger, LoggerInterceptor],
})
export class LoggerModule {}