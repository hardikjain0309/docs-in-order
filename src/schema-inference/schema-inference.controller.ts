import { Controller, Get, Param } from "@nestjs/common";
import SchemaInferenceService from "./schema-inference.service.js";

@Controller("workspaces/:workspaceId")
export default class SchemaInferenceController {
  constructor(
    private readonly schemaIntefernceService: SchemaInferenceService,
  ) {}
  @Get("inferredschemas")
  getInferredSchemas(@Param("workspaceId") workspaceId: string) {
    return this.schemaIntefernceService.getCanonicalSchemasAndMappings(
      workspaceId,
    );
  }
}
