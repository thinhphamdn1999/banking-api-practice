import dotenv from 'dotenv';
import { DEFAULT_ENVIRONMENT_CONFIG, NODE_ENVIRONMENT } from '../constants/environment';

dotenv.config();

interface EnvironmentConfig {
  port: number;
  nodeEnvironment: string;
  corsOrigin: string[];
}

// Load environment variables with defaults
const environmentConfig: EnvironmentConfig = {
  port: Number(process.env.PORT) || DEFAULT_ENVIRONMENT_CONFIG.PORT,
  nodeEnvironment: process.env.NODE_ENV || DEFAULT_ENVIRONMENT_CONFIG.NODE_ENVIRONMENT,
  corsOrigin: (process.env.CORS_ORIGIN || DEFAULT_ENVIRONMENT_CONFIG.CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim()),
};

// Determine if the current environment is production
export const isProduction = environmentConfig.nodeEnvironment === NODE_ENVIRONMENT.PRODUCTION;

export default environmentConfig;
