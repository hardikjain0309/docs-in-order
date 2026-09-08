import { Module } from "@nestjs/common";
import FileProcessingService from "./fileProcessing.service.js";
import WorkspaceModule from "../workspace/workspace.module.js";
import AIIntegrationModule from "../ai-integration/ai-integration.module.js";
import PrismaModule from "../prisma/prisma.module.js";
import FileParserModule from "../file-parser/file-parser.module.js";
import RecordExtractionModule from "../record-extraction/record-extraction.module.js";
import SchemaInferenceModule from "../schema-inference/schema-inference.module.js";

@Module({
  imports: [
    WorkspaceModule,
    AIIntegrationModule,
    PrismaModule,
    FileParserModule,
    RecordExtractionModule,
    SchemaInferenceModule,
  ],
  providers: [FileProcessingService],
  exports: [FileProcessingService],
})
export default class FileProcessingModule {}
