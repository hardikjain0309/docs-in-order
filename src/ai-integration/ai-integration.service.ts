import { Injectable } from "@nestjs/common";
import { OfficeParserAST } from "officeparser";
import { GoogleGenAI } from "@google/genai";
import { AppConfig } from "../app.config.js";
import * as z from "zod";
import {
  ClassifyEntityTypesAndConsolidateSchemasPrompt,
  ExtractRecordsAndMetadataPrompt,
} from "./ai-prompt-config/ai-prompt-templates.js";
import { RecordExtractionOutputStructure } from "./dto/record-extraction-dto.js";
import {
  SchemaInferenceOutputStructure,
  SchemaInferencePromptPayload,
} from "./dto/schema-inference-dto.js";
import recordExtractionOutputSchema from "./ai-prompt-config/recordExtractionOutputStructure.json" with { type: "json" };
import schemaInferenceOutputStructure from "./ai-prompt-config/schemaInferenceOutputStructure.json" with { type: "json" };

@Injectable()
export default class AIIntegrationService {
  private static gemini = new GoogleGenAI({
    vertexai: false,
    apiKey: AppConfig.GEMINI_KEY,
    httpOptions: {
      retryOptions: {
        attempts: 1, // No retries due to rate limiting issues with Gemini API
      },
    },
  });

  constructor() {}

  formatPromptTemplate(template: string, payload: any) {
    return template.replace("<payload>", JSON.stringify(payload));
  }

  async extractRecordsFromFileAST(file: OfficeParserAST) {
    const interaction = await AIIntegrationService.gemini.interactions.create({
      model: "gemini-3.6-flash",
      input: this.formatPromptTemplate(ExtractRecordsAndMetadataPrompt, file),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: recordExtractionOutputSchema as Record<string, any>,
      },
    });

    const outputSchema = z.fromJSONSchema(
      recordExtractionOutputSchema as Record<string, any>,
    );
    return outputSchema.parse(
      JSON.parse(interaction.output_text),
    ) as RecordExtractionOutputStructure;
  }

  async inferSchemasFromExtractedRecords(
    payload: SchemaInferencePromptPayload[],
  ) {
    const interaction = await AIIntegrationService.gemini.interactions.create({
      model: "gemini-3.6-flash",
      input: this.formatPromptTemplate(
        ClassifyEntityTypesAndConsolidateSchemasPrompt,
        payload,
      ),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schemaInferenceOutputStructure as Record<string, any>,
      },
    });

    const outputSchema = z.fromJSONSchema(
      schemaInferenceOutputStructure as Record<string, any>,
    );
    return outputSchema.parse(
      JSON.parse(interaction.output_text),
    ) as SchemaInferenceOutputStructure;
  }
}
