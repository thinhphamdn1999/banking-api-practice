import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';

export async function loadOpenApiSpec() {
  const filePath = path.join(process.cwd(), 'src/docs/openapi.yaml');
  const api = await SwaggerParser.bundle(filePath);
  return api;
}
