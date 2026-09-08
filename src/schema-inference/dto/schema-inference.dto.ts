import { SchemaField } from "../../ai-integration/dto/record-extraction-dto.js";

export interface FileEntitySchemaMapping {
  file: string;
  fieldMappings: {
    originalFieldLabel: string;
    canonicalFieldLabel: string;
  }[];
}

export interface InferredSchema {
  entityType: string;
  canonicalSchema: SchemaField[];
  fileMappings: FileEntitySchemaMapping[];
}

export interface InferredSchemasResponseDto {
  schemas: Array<InferredSchema>;
}
