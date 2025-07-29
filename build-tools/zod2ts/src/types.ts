export interface CliOptions {
  zodPath: string;
  outputDir: string;
  typeName?: string;
}

export interface SchemaInfo {
  name: string;
  typeName: string;
  resolvedType: string;
}

export interface ExtractionResult {
  schemas: SchemaInfo[];
  outputFiles: string[];
}

export class ZodToTsError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ZodToTsError';
  }
}

export class FileNotFoundError extends ZodToTsError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
  }
}

export class NoSchemasFoundError extends ZodToTsError {
  constructor(filePath: string) {
    super(
      `No schemas found in file: ${filePath}. Expected Zod schema variables`,
      'NO_SCHEMAS_FOUND'
    );
  }
}

export class InvalidSchemaError extends ZodToTsError {
  constructor(schemaName: string) {
    super(`Invalid schema: ${schemaName}. Must be a valid Zod schema`, 'INVALID_SCHEMA');
  }
}

export class SchemaLoadingError extends ZodToTsError {
  constructor(message: string) {
    super(message, 'SCHEMA_LOADING_ERROR');
  }
}

export class TypeGenerationError extends ZodToTsError {
  constructor(message: string) {
    super(message, 'TYPE_GENERATION_ERROR');
  }
}
