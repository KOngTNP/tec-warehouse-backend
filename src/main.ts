import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { LoggerInterceptor } from './features/logger/logger.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 20 }));
  app.enableCors({
      origin: ['http://192.168.1.253:3000',
        "http://www.trerasit.com",
        "http://192.168.1.149:3000",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(compression());
  app.useGlobalInterceptors(await app.resolve(LoggerInterceptor));
  const options = new DocumentBuilder()
    .setTitle('TEC warehouse Backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(app.get(ConfigService).get('port'));
}
bootstrap();
