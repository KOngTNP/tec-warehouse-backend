import { config as developmentConfig } from './config.development';
import { config as localConfig } from './config.local';
import { config as productionConfig } from './config.production';
import { config as stagingConfig } from './config.staging';

const configMap = {
  local: localConfig,
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

export const config = () => {
  const mode = process.env.CONFIG_NAME || 'local';

  console.log(`process.env.CONFIG_NAME [${process.env.CONFIG_NAME}]`);
  console.log(`Using config [${mode}]`);
  console.log(configMap[mode]());
  return configMap[mode](); // 🔥 เรียก function
};