import { ConflictException, Injectable } from "@nestjs/common";
import AIIntegrationService from "../ai-integration/ai-integration.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  RecordExtractionOutputStructure,
  SchemaField,
} from "../ai-integration/dto/record-extraction-dto.js";
import {
  OriginalToCanonicalFieldMapping,
  SchemaInferenceOutputStructure,
  SchemaInferencePromptPayload,
} from "../ai-integration/dto/schema-inference-dto.js";
import { Prisma, WorkspaceState } from "../prisma/generated/client.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import { OrderedWorkspaceStates } from "../workspace/dto/workspace-constants.js";
import { WorkspaceErrorDto } from "../workspace/dto/workspace-error.dto.js";
import {
  FileEntitySchemaMapping,
  InferredSchema,
  InferredSchemasResponseDto,
} from "./dto/schema-inference.dto.js";

@Injectable()
export default class SchemaInferenceService {
  constructor(
    private readonly aiIntegrationService: AIIntegrationService,
    private readonly prisma: PrismaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async inferCanonicationSchemasFromExtractedRecords(
    workspaceId: string,
    files: Express.Multer.File[],
    recordExtractionResultMap: Record<string, RecordExtractionOutputStructure>,
  ) {
    const schemaInferencePayload: SchemaInferencePromptPayload[] =
      files.flatMap((file) => {
        const extractionResult = recordExtractionResultMap[file.originalname];

        return extractionResult.entity_types.map((entityType) => ({
          ...entityType,
          source_file: file.originalname,
          sample_records: extractionResult.records
            .filter((record) => record.entity_type === entityType.name)
            .slice(0, 5),
        }));
      });
    let schemaInferenceError: Error | null = null;
    let inferredSchemas: SchemaInferenceOutputStructure = { schemas: [] };
    try {
      inferredSchemas =
        await this.aiIntegrationService.inferSchemasFromExtractedRecords(
          schemaInferencePayload,
        );
    } catch (error) {
      schemaInferenceError = error as Error;
    }

    if (schemaInferenceError) {
      return {
        inferredSchemas,
        schemaInferenceError,
      };
    }

    // Store inferred schemas in DB
    await this.prisma.$transaction(async (transaction) => {
      await transaction.schema.deleteMany({ where: { workspaceId } });
      if (inferredSchemas.schemas.length > 0) {
        await transaction.schema.createMany({
          data: inferredSchemas.schemas.map((schema) => ({
            workspaceId,
            entityType: schema.entity_type,
            schema_fields:
              schema.canonical_schema as unknown as Prisma.InputJsonValue[],
            field_mappings:
              schema.mappings as unknown as Prisma.InputJsonValue[],
          })),
        });
      }
    });

    return {
      inferredSchemas,
      schemaInferenceError,
    };
  }

  async getCanonicalSchemasAndMappings(workspaceId: string) {
    // Check if workspace exists
    const workspace = await this.workspaceService.findOne(workspaceId);

    if (
      OrderedWorkspaceStates.indexOf(workspace.state) <
      OrderedWorkspaceStates.indexOf(WorkspaceState.SCHEMA_INFERRED)
    ) {
      throw new ConflictException(
        "Schema inference has not completed for this workspace.",
      );
    }

    if ((workspace.error as WorkspaceErrorDto)?.errors?.length > 0) {
      throw new ConflictException(
        "File processing has failed, cannot return inferred schemas.",
      );
    }
    const schemas = await this.prisma.schema.findMany({
      where: { workspaceId },
    });

    const inferredSchemas: InferredSchemasResponseDto = { schemas: [] };

    inferredSchemas.schemas = schemas.map((schema) => {
      const canonicalSchema = schema.schema_fields as unknown as SchemaField[];
      const inferredSchema: InferredSchema = {
        entityType: schema.entityType,
        canonicalSchema,
        fileMappings: [],
      };
      const canonicalSchemaFieldToLabel: Record<string, string> = {};
      canonicalSchema.forEach((schemaField) => {
        canonicalSchemaFieldToLabel[schemaField.field] = schemaField.label;
      });
      const fieldMappings =
        schema.field_mappings as unknown as OriginalToCanonicalFieldMapping[];

      const mappingsByFile = fieldMappings.reduce<
        Map<string, FileEntitySchemaMapping["fieldMappings"]>
      >((mappings, mapping) => {
        const fileMapping = mappings.get(mapping.source_file) ?? [];
        fileMapping.push({
          originalFieldLabel: mapping.original_field_name,
          canonicalFieldLabel:
            canonicalSchemaFieldToLabel[mapping.canonical_schema_field],
        });
        mappings.set(mapping.source_file, fileMapping);
        return mappings;
      }, new Map<string, FileEntitySchemaMapping["fieldMappings"]>());

      inferredSchema.fileMappings = Array.from(mappingsByFile.entries()).map(
        ([file, fileMappings]) => ({ file, fieldMappings: fileMappings }),
      );

      return inferredSchema;
    });

    return inferredSchemas;
  }
}
