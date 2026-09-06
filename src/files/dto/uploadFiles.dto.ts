export interface FilesValidationResult {
  errors: {
    fileName: string;
    errors: string[];
  }[];
}
