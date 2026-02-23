import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import fs from 'fs';
import { AppModule } from 'src/app.module';

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);

  const ormConfig = {
    type: 'mysql',
    host: configService.get('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.name'),
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    timezone: 'utc',
    synchronize: false,
    bigNumberStrings: false,
    // logging:
    //   process.env.CONFIG_NAME === 'local' ||
    //   process.env.CONFIG_NAME === 'development',
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
    migrations: ['src/migrations/*.ts'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  };

  console.log('ormconfig.json');
  console.log('---------------------');
  console.log(ormConfig);
  fs.writeFileSync('ormconfig.json', JSON.stringify(ormConfig, null, 2));
  console.log('---------------------');
};

run().then(() => process.exit());
