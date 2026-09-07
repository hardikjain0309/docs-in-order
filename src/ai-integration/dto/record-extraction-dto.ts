export enum SupportedDataTypes {
  string = "string",
  number = "number",
  date = "date",
  boolean = "boolean",
  currency = "currency",
}

export interface SchemaField {
  name: string;
  data_type: SupportedDataTypes;
}

export interface ExtractedEntityType {
  name: string;
  schema: SchemaField[];
}

export interface LabelValueItem {
  label: string;
  value: string;
}

export interface FieldValueItem {
  field: string;
  value: string;
}

export interface ExtractedRecord {
  entity_type: string;
  data: FieldValueItem[];
}

export interface RecordExtractionOutputStructure {
  metadata: LabelValueItem[];
  entity_types: ExtractedEntityType[];
  records: ExtractedRecord[];
}
