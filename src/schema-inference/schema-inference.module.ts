import { Module } from "@nestjs/common";
import SchemaInferenceService from "./schema-inference.service.js";
import AIIntegrationModule from "../ai-integration/ai-integration.module.js";
import PrismaModule from "../prisma/prisma.module.js";
import WorkspaceModule from "../workspace/workspace.module.js";
import SchemaInferenceController from "./schema-inference.controller.js";

@Module({
  providers: [SchemaInferenceService],
  imports: [PrismaModule, AIIntegrationModule, WorkspaceModule],
  exports: [SchemaInferenceService],
  controllers: [SchemaInferenceController],
})
export default class SchemaInferenceModule {}
