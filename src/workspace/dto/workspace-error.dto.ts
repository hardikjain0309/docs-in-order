import { FileError } from "../../files/dto/uploadFiles.dto.js";

export interface StageError {
  stage: string;
  errors: string[];
}

export interface WorkspaceErrorDto {
  [key: string]: any;
  errors: FileError[] | StageError[];
}
