import { Injectable } from "@nestjs/common";

@Injectable()
export default class FileProcessingService {
  startProcessing(workspaceId: string, files: Express.Multer.File[]) {
    // Validate each file for extension and size
    console.log(`Starting processing for workspace: ${workspaceId}`);
    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
    }
  }
}
