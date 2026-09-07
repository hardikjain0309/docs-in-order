import { Module } from "@nestjs/common";
import FileProcessingService from "./fileProcessing.service.js";
import WorkspaceModule from "../workspace/workspace.module.js";
import AIIntegrationModule from "../ai-integration/ai-integration.module.js";
import PrismaModule from "../prisma/prisma.module.js";

@Module({
  imports: [WorkspaceModule, AIIntegrationModule, PrismaModule],
  providers: [FileProcessingService],
  exports: [FileProcessingService],
})
export default class FileProcessingModule {}
