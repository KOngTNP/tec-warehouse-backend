import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DefaultLogger } from './default-logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private logger: DefaultLogger) {
    logger.setContext('LoggerPlugin');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType<GqlContextType>() === 'graphql') {
      const now = Date.now();
      const ctx = GqlExecutionContext.create(context);
      const info = ctx.getInfo();
      this.logger.log(`[Request] ${info.path.typename} - ${info.path.key}`);
      return next.handle().pipe(
        tap(() => {
          this.logger.log(
            `[Response] ${info.path.typename} - ${info.path.key} + ${
              Date.now() - now
            }ms`,
          );
        }),
      );
    }
    return next.handle();
  }
}
