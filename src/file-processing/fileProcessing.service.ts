import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OfficeParser, OfficeParserAST } from "officeparser";
import { FileError } from "../files/dto/uploadFiles.dto.js";
import { WorkspaceService } from "../workspace/workspace.service.js";
import AIIntegrationService from "../ai-integration/ai-integration.service.js";
import {
  SchemaInferenceOutputStructure,
  SchemaInferencePromptPayload,
} from "../ai-integration/dto/schema-inference-dto.js";
import { RecordExtractionOutputStructure } from "../ai-integration/dto/record-extraction-dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma } from "../prisma/generated/client.js";
@Injectable()
export default class FileProcessingService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly aiIntegrationService: AIIntegrationService,
    private readonly prisma: PrismaService,
  ) {}
  private async parseFile(file: Express.Multer.File) {
    return await OfficeParser.parseOffice(file.buffer);
  }
  async startProcessing(workspaceId: string, files: Express.Multer.File[]) {
    // Parse each file for their AST
    const parseErrors: FileError[] = [];
    const astMap: Record<string, OfficeParserAST> = {};
    await Promise.all(
      files.map(async (file) => {
        try {
          astMap[file.originalname] = await this.parseFile(file);
        } catch (error) {
          parseErrors.push({
            fileName: file.originalname,
            errors: [
              error instanceof Error ? error.message : "Failed to parse file",
            ],
          });
        }
      }),
    );
    await this.workspaceService.transitionToParsingCompleted(workspaceId, {
      errors: parseErrors,
    });
    if (parseErrors.length > 0) {
      return;
    }
    const extractionResultsMap: Record<
      string,
      RecordExtractionOutputStructure
    > = {};
    const extractionErrors: FileError[] = [];
    await Promise.all(
      files.map(async (file) => {
        try {
          const ast = astMap[file.originalname];
          const extractionResults =
            await this.aiIntegrationService.extractRecordsFromFileAST(ast);
          extractionResultsMap[file.originalname] = extractionResults;
          console.log(
            "Records extracted from file:",
            file.originalname,
            extractionResults,
          );
        } catch (error) {
          extractionErrors.push({
            fileName: file.originalname,
            errors: [
              error instanceof Error
                ? error.message
                : "Failed to extract records from file",
            ],
          });
        }
      }),
    );

    if (extractionErrors.length > 0) {
      await this.workspaceService.transitionToExtractionCompleted(workspaceId, {
        errors: extractionErrors,
      });
      return;
    }

    await this.writeAiOutput(
      `record-extraction-${workspaceId}.json`,
      extractionResultsMap,
    );

    const rawData = Object.entries(extractionResultsMap).reduce(
      (aggregate, [sourceFile, extractionResult]) => {
        aggregate.metadata.push(
          ...extractionResult.metadata.map((metadata) => ({
            source_file: sourceFile,
            ...metadata,
          })),
        );
        aggregate.records.push(
          ...extractionResult.records.map(
            (record) =>
              ({
                source_file: sourceFile,
                ...record,
              }) as unknown as Prisma.InputJsonValue,
          ),
        );
        aggregate.entityTypes.push(
          ...extractionResult.entity_types.map(
            (entityType) =>
              ({
                source_file: sourceFile,
                ...entityType,
              }) as unknown as Prisma.InputJsonValue,
          ),
        );
        return aggregate;
      },
      {
        metadata: [] as Prisma.InputJsonValue[],
        records: [] as Prisma.InputJsonValue[],
        entityTypes: [] as Prisma.InputJsonValue[],
      },
    );

    await this.prisma.rawdata.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        metadata: rawData.metadata,
        records: rawData.records,
        entityTypes: rawData.entityTypes,
      },
      update: {
        metadata: rawData.metadata,
        records: rawData.records,
        entityTypes: rawData.entityTypes,
      },
    });

    const schemaInferencePayload: SchemaInferencePromptPayload[] =
      files.flatMap((file) => {
        const extractionResult = extractionResultsMap[file.originalname];

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
      await this.workspaceService.transitionToSchemaInferred(workspaceId, {
        errors: [
          {
            stage: "schema-inference",
            errors: [
              schemaInferenceError.message ||
                "Failed to infer schemas from extracted records",
            ],
          },
        ],
      });
      return;
    }

    await this.writeAiOutput(
      `schema-inference-${workspaceId}.json`,
      inferredSchemas,
    );

    await this.prisma.$transaction(async (transaction) => {
      await transaction.schema.deleteMany({ where: { workspaceId } });
      if (inferredSchemas.schemas.length > 0) {
        await transaction.schema.createMany({
          data: inferredSchemas.schemas.map((schema) => ({
            workspaceId,
            entityType: schema.entity_type,
            schema_fields: schema.canonical_schema.map(
              (field) => field as unknown as Prisma.InputJsonValue,
            ),
            field_mappings: schema.mappings.map(
              (mapping) => mapping as unknown as Prisma.InputJsonValue,
            ),
          })),
        });
      }
    });

    await this.workspaceService.transitionToSchemaInferred(workspaceId);
  }

  private async writeAiOutput(fileName: string, output: unknown) {
    const outputDirectory = join(process.cwd(), "ai-prompt-outputs");
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      join(outputDirectory, fileName),
      `${JSON.stringify(output, null, 2)}\n`,
      "utf8",
    );
  }
}
