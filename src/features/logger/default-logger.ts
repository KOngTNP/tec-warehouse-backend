import { Injectable, Logger, Scope } from '@nestjs/common';
import * as winston from 'winston';

// ไม่ต้อง import { LoggingWinston } from '@google-cloud/logging-winston';

const defaultFormat = winston.format.printf((info) => {
  const label = (info.metadata && (info.metadata as any).label) || '';
  return `${info.timestamp} [${label}] ${info.level}: ${info.message}`;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize({ all: true })),
  }),
];

@Injectable({ scope: Scope.TRANSIENT })
export class DefaultLogger extends Logger {
  static readonly logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.metadata(),
      winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm' }),
      defaultFormat,
    ),
    transports: transports,
  });

   setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    DefaultLogger.logger.info(message, { label: context ?? this.context });
  }

  error(message: string, trace?: string, context?: string) {
    DefaultLogger.logger.error(`${message} : ${trace}`, {
      label: context ?? this.context,
    });
  }

  warn(message: string, context?: string) {
    DefaultLogger.logger.warn(message, { label: context ?? this.context });
  }

  debug(message: string, context?: string) {
    DefaultLogger.logger.debug(message, { label: context ?? this.context });
  }

  verbose(message: string, context?: string) {
    DefaultLogger.logger.verbose(message, { label: context ?? this.context });
  }
}
