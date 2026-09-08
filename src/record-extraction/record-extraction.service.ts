import { Injectable } from "@nestjs/common";
import AIIntegrationService from "../ai-integration/ai-integration.service.js";
import { RecordExtractionOutputStructure } from "../ai-integration/dto/record-extraction-dto.js";
import { FileError } from "../files/dto/uploadFiles.dto.js";
import { OfficeParserAST } from "officeparser";
import { Prisma } from "../prisma/generated/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export default class RecordExtractionService {
  constructor(
    private readonly aiIntegrationService: AIIntegrationService,
    private readonly prisma: PrismaService,
  ) {}

  async extractRecordsFromFiles(
    workspaceId: string,
    files: Express.Multer.File[],
    astMap: Record<string, OfficeParserAST>,
  ) {
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
        } catch (error) {
          console.log("error: ", error);
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
      return {
        extractionErrors,
        extractionResultsMap,
      };
    }

    // Store extracted records and metadata in DB
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

    return {
      extractionErrors,
      extractionResultsMap,
    };
  }
}
