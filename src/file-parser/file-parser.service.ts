import { Injectable } from "@nestjs/common";
import { FileError } from "../files/dto/uploadFiles.dto.js";
import OfficeParser, { OfficeParserAST } from "officeparser";

@Injectable()
export default class FileParserService {
  constructor() {}

  async parseFiles(files: Express.Multer.File[]) {
    const parseErrors: FileError[] = [];
    const astMap: Record<string, OfficeParserAST> = {};
    await Promise.all(
      files.map(async (file) => {
        try {
          astMap[file.originalname] = await OfficeParser.parseOffice(
            file.buffer,
          );
        } catch (error) {
          parseErrors.push({
            fileName: file.originalname,
            errors: [
              error instanceof Error ? error.message : "Failed to parse file",
            ],
          });
        }
      }),
    );
    return {
      parseErrors,
      astMap,
    };
  }
}
