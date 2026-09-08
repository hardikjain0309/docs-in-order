import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { WorkspaceService } from "../workspace/workspace.service.js";
import AIIntegrationService from "../ai-integration/ai-integration.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import FileParserService from "../file-parser/file-parser.service.js";
import RecordExtractionService from "../record-extraction/record-extraction.service.js";
import SchemaInferenceService from "../schema-inference/schema-inference.service.js";
@Injectable()
export default class FileProcessingService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly aiIntegrationService: AIIntegrationService,
    private readonly prisma: PrismaService,
    private readonly fileParserService: FileParserService,
    private readonly recordExtractionService: RecordExtractionService,
    private readonly schemaInferenceService: SchemaInferenceService,
  ) {}
  async startProcessing(workspaceId: string, files: Express.Multer.File[]) {
    // Parse each file for their AST
    const { parseErrors, astMap } =
      await this.fileParserService.parseFiles(files);

    // Transition workspace to parsing completed
    await this.workspaceService.transitionToParsingCompleted(workspaceId, {
      errors: parseErrors,
    });

    if (parseErrors.length > 0) {
      return;
    }

    // Extract records and metadata from files
    const { extractionErrors, extractionResultsMap } =
      await this.recordExtractionService.extractRecordsFromFiles(
        workspaceId,
        files,
        astMap,
      );

    await this.writeAiOutput(
      `record-extraction-${workspaceId}.json`,
      extractionResultsMap,
    );

    if (extractionErrors.length > 0) {
      // Transition to extraction completed state with errors
      await this.workspaceService.transitionToExtractionCompleted(workspaceId, {
        errors: extractionErrors,
      });
      return;
    }

    // Transition state to extraction completed
    await this.workspaceService.transitionToExtractionCompleted(workspaceId);

    // Infer canonical schemas from extracted records
    const { inferredSchemas, schemaInferenceError } =
      await this.schemaInferenceService.inferCanonicationSchemasFromExtractedRecords(
        workspaceId,
        files,
        extractionResultsMap,
      );

    if (schemaInferenceError) {
      // Transition to schema inferred with error
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

    // Transition to schema inferred
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
