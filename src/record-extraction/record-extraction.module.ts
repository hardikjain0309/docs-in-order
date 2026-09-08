import { Module } from "@nestjs/common";
import RecordExtractionService from "./record-extraction.service.js";
import AIIntegrationModule from "../ai-integration/ai-integration.module.js";
import PrismaModule from "../prisma/prisma.module.js";

@Module({
  providers: [RecordExtractionService],
  exports: [RecordExtractionService],
  imports: [AIIntegrationModule, PrismaModule],
})
export default class RecordExtractionModule {}
