export type Config = {
  port: number;
  database: {
    port: number;
    host: string;
    username: string;
    password: string;
    name: string;
    slave: [
      {
        port: number;
        host: string;
        username: string;
        password: string;
        name: string;
      },
    ];
  };
  baseUrl: string
  firebase: {
    databaseURL: string;
    storageBucket: string;
  };
  serviceAccountPath: string;
  seller: {
    secretKey: string;
  };
};
