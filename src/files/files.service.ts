import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspaceService } from "../workspace/workspace.service.js";
import FileProcessingService from "../file-processing/fileProcessing.service.js";
import { FilesValidationResult } from "./dto/uploadFiles.dto.js";
import { WorkspaceState } from "../prisma/generated/browser.js";
import { PrismaService } from "../prisma/prisma.service.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".txt"];

@Injectable()
export default class FilesService {
  constructor(
    private readonly fileProcessingService: FileProcessingService,
    private readonly workspaceService: WorkspaceService,
    private readonly prisma: PrismaService,
  ) {}
  private validateFiles = (
    files: Express.Multer.File[],
  ): FilesValidationResult => {
    const validationResult: FilesValidationResult = {
      errors: [],
    };
    // Implementation for validating files
    files.forEach((file) => {
      const fileErrors: string[] = [];
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(
          `File size exceeds the maximum limit of ${MAX_FILE_SIZE} bytes.`,
        );
      }
      // Check file extension
      const fileExtension = file.originalname.split(".").pop();
      if (!ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
        fileErrors.push(`File extension .${fileExtension} is not allowed.`);
      }
      if (fileErrors.length > 0) {
        validationResult.errors.push({
          fileName: file.originalname,
          errors: fileErrors,
        });
      }
    });
    return validationResult;
  };

  private async saveFilesToDatabase(
    workspaceId: string,
    files: Express.Multer.File[],
  ) {
    // Implementation for saving files to the database
    for (const file of files) {
      await this.prisma.file.create({
        data: {
          workspaceId,
          name: file.originalname,
          size: file.size,
        },
      });
    }
  }

  async uploadFiles(workspaceId: string, files: Express.Multer.File[]) {
    // Validate that workspace exists and is in the correct state for file upload
    const workspace = await this.workspaceService.findOne(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    if (workspace.state !== WorkspaceState.DRAFT) {
      throw new ConflictException("Invalid workspace state for file upload");
    }

    // Validate and start processing the files
    const validationResult = this.validateFiles(files);

    if (validationResult.errors.length > 0) {
      throw new BadRequestException({
        message: "File validation failed",
        validationResult,
      });
    }

    // Save the files to the database
    await this.saveFilesToDatabase(workspaceId, files);

    // Transition the workspace state to FILES_UPLOADED
    await this.workspaceService.transitionToFilesUploaded(workspaceId);

    // Start processing the files - non blocking
    this.fileProcessingService.startProcessing(workspaceId, files);
  }

  async listFiles(workspaceId: string) {
    // Get list of files for the given workspaceId from the DB
    const files = await this.prisma.file.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
    return files;
  }
}
