import {
  ExtractedEntityType,
  ExtractedRecord,
  SchemaField,
} from "./record-extraction-dto.js";

export interface SchemaInferencePromptPayload extends ExtractedEntityType {
  source_file: string;
  sample_records: ExtractedRecord[];
}

export interface OriginalToCanonicalFieldMapping {
  entity_type: string;
  source_file: string;
  original_field: string;
  original_field_name: string;
  canonical_schema_field: string;
}

export interface InferredSchema {
  entity_type: string;
  canonical_schema: SchemaField[];
  mappings: OriginalToCanonicalFieldMapping[];
}

export interface SchemaInferenceOutputStructure {
  schemas: InferredSchema[];
}
