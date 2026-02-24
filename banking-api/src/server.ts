import 'reflect-metadata';
import 'dotenv/config';

import swaggerUi from 'swagger-ui-express';
import config from '@/common/configs/env';

import { AppDataSource } from '@/common/configs/data-source';
import { loadOpenApiSpec } from '@/common/configs/swagger';

import app from '@/app';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const spec = await loadOpenApiSpec();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

bootstrap();
