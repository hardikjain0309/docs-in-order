export const ExtractRecordsAndMetadataPrompt =
  "Extract metadata and records from AST of a file <payload>";
export const ClassifyEntityTypesAndConsolidateSchemasPrompt =
  "Classify these entity schemas obtained from extracting records from different files to obtain canonical schemas for each entity type with mappings from original schema to the canonical schema preserving source file names. Make sure to include canonical schemas in output even if the entity type maps to only 1 schema. <payload>";
