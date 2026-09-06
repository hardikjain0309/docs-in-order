import { Module } from "@nestjs/common";
import FilesService from "./files.service.js";
import { FilesController } from "./files.controller.js";
import FileProcessingModule from "../file-processing/fileProcessing.module.js";
import WorkspaceModule from "../workspace/workspace.module.js";
import PrismaModule from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, WorkspaceModule, FileProcessingModule],
  providers: [FilesService],
  controllers: [FilesController],
})
export default class FilesModule {}
