import dotenv from 'dotenv';
import { DEFAULT_ENVIRONMENT_CONFIG, NODE_ENVIRONMENT } from '../constants/environment';

dotenv.config();

interface EnvironmentConfig {
  port: number;
  nodeEnvironment: string;
  corsOrigin: string[];
  database: {
    host: string;
    port: number;
    name: string | undefined;
    user: string | undefined;
    password: string | undefined;
    testName: string | undefined;
  };
}

// Load environment variables with defaults
const environmentConfig: EnvironmentConfig = {
  port: Number(process.env.PORT) || DEFAULT_ENVIRONMENT_CONFIG.PORT,
  nodeEnvironment: process.env.NODE_ENV || DEFAULT_ENVIRONMENT_CONFIG.NODE_ENVIRONMENT,
  corsOrigin: (process.env.CORS_ORIGIN || DEFAULT_ENVIRONMENT_CONFIG.CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim()),
  database: {
    host: process.env.DATABASE_HOST || DEFAULT_ENVIRONMENT_CONFIG.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || DEFAULT_ENVIRONMENT_CONFIG.DATABASE_PORT,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    testName: process.env.DATABASE_TEST_NAME,
  },
};

// Determine if the current environment is production
export const isProduction = environmentConfig.nodeEnvironment === NODE_ENVIRONMENT.PRODUCTION;

export default environmentConfig;
