import path from 'path';
import { Config } from './config';

export const config: Config = {
  port: 5000,
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    slave: [
      {
        host: process.env.SLAVE_HOST,
        port: Number(process.env.SLAVE_PORT) || 25060,
        username: process.env.SLAVE_USERNAME,
        password: process.env.SLAVE_PASSWORD,
        name: process.env.SLAVE_NAME,
      },
    ],
  },
  baseUrl: process.env.BASE_URL,
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  serviceAccountPath: path.resolve(
    process.env.SERVICE_ACCOUNT_PATH,
  ),
  seller: {
    secretKey:
      process.env.SELLER_SECRET_KEY,
  },
};
