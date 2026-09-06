import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import FilesService from "./files.service.js";
import { FilesInterceptor } from "@nestjs/platform-express";

@Controller("workspaces/:workspaceId/files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FilesInterceptor("files", 10))
  @HttpCode(202)
  uploadFiles(
    @Param("workspaceId") workspaceId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log(
      "files",
      files.map((file) => file.originalname),
    );
    return this.filesService.uploadFiles(workspaceId, files);
  }

  @Get()
  async listFiles(@Param("workspaceId") workspaceId: string) {
    return this.filesService.listFiles(workspaceId);
  }
}
