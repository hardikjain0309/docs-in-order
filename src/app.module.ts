import { Module } from "@nestjs/common";
import PrismaModule from "./prisma/prisma.module.js";
import WorkspaceModule from "./workspace/workspace.module.js";
import FilesModule from "./files/files.modules.js";
import FileProcessingModule from "./file-processing/fileProcessing.module.js";
import SchemaInferenceModule from "./schema-inference/schema-inference.module.js";

@Module({
  imports: [
    PrismaModule,
    WorkspaceModule,
    FilesModule,
    FileProcessingModule,
    SchemaInferenceModule,
  ],
})
export class AppModule {}
