export interface FileError {
  fileName: string;
  errors: string[];
}
export interface FilesValidationResult {
  errors: FileError[];
}
