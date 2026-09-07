import { Module } from "@nestjs/common";
import AIIntegrationService from "./ai-integration.service.js";

@Module({
  providers: [AIIntegrationService],
  exports: [AIIntegrationService],
})
export default class AIIntegrationModule {}
