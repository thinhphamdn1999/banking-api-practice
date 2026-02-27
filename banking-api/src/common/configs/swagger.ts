import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';

/**
 * Loads and parses the OpenAPI specification from the YAML file.
 * @returns - The parsed OpenAPI specification object.
 */
export async function loadOpenApiSpec() {
  const filePath = path.join(process.cwd(), 'src/docs/openapi.yaml');
  const api = await SwaggerParser.bundle(filePath);
  return api;
}
