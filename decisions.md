# Decisions

## Problem Statement

Turn messy documents into structured, queryable data

Build a system that takes unstructured or semi-structured documents and converts them into clean, structured data that can be searched and queried.

## Tech Stack

- **Backend Framework:** NestJS
- **DB:** PostgreSQL
- **ORM:** Prisma
- **Frontend Frameword:** React
- **Component Library:** MaterialUI
- **Frontend State Management:** Redux ToolKit
- **Language:** Typescript

#### Reasoning
The architecture designed for this tool can be satisfactorily implemented with this tech stack. Additionally, my familiarity with this stack will decrease development time.

## MVP Scope

### Who is the user?
The intended user is someone who has heterogeneous documents i.e. data not following a consistent structure

### Primary user scenario
The user being unaware of the underlying structure of the documents should be suggested schemas of the data inside them and get a consolidated, queryable view of this data.

### Domain of data this implementation's happy path is being tested against
Financial statements/ Expense reports
#### Reasoning
This domain makes the user scenario most relevant since financial statements can have multiple sources and formats and data consolidation and classification requires a lot of human intervention which means it's a great problem to solve

### Support for multiple entity types
For MVP multiple entity types are not being tested 
#### Reasoning
That would mean establishing relationships between these entity type which would lead to further need for review and confirmation from user, so to trim the scope and implement with good confidence, all documents this tool is tested with will have data on a single entity type like Expense or Invoice or Reimbursement

### Supported document types
- PDF
- Word doc (.DOCX)
- Excel spreadsheet (.XLSX)
#### Alternatives
.doc, .csv, .html
#### Reasoning
Other file extensions could also be parsed but defining the scope increases velocity since the core problem is not parsing files but to build relationships within the parsed data

### Supported information types
Text
#### Alternatives
Images
#### Reasoning
Processing images needs a whole different set of capabilities than text does, so to trim the scope, only text will be supported

### Unsupported document types
- Scanned or image-only PDFs

## High Level Design

### Document Processing Workflow
              UNKNOWN DOCUMENTS
                     ↓
                LLM ANALYSIS
                     ↓
              INFERRED SCHEMA
                     ↓
            USER CONFIRMATION
                     ↓
                VALIDATION
                     ↓
               NORMALIZATION
                     ↓
               CANONICAL DATA
                     ↓
                  DATABASE

#### Steps:
1. Identify document type
1. Document Parsing: Extract text/tables
1. LLM Extraction: Convert parsed output into JSONs (Schema Inference)
1. LLM Classification and Schema Consolidation: Classify JSON objects into entity types and consolidate heterogenic schemas of an entity type into canonical schemas with mapping
1. Get user confirmation on the generated schema inference and mapping
1. Validate and normalize JSON into structured records and throw errors if needed
1. Store structured records with source-document/page references (provenance)

### Primary UX Workflow



#### Why LLM Analysis?
The core solution of this problem cannot be deterministic since the documents are "messy" which means no predefined structure, hence, there needs to be an element of AI involved to extract, classify and infer schemas of the underlying data

## Low Level Design

### Documents Parsing

#### Library used
<a href="https://www.npmjs.com/package/officeparser">Office parser</a>
##### Reasoning
This library supports all document types this tool needs to support and parses files into a rich Abstract Syntax Tree (AST) which can be a consistent input to the LLM extraction prompt

### LLM Integration

#### API provider
Google Gemini API
#### Integration method
JavaScript SDK: @google/genai

#### LLM Extraction Prompt and Output Structure
Prompt: Extract metadata and records from AST of a file {AST of the parsed file}
LLM Output structure: [recordExtraction.json](./ai-integration/ai-prompt-output-schema/recordExtraction.json)

#### LLM Classification and Schema Consolidation Prompt and Output Structure
Prompt: Classify these entity schemas obtained from extracting records from different files to obtain canonical schemas with mappings from original schema to the canonical schema preserving source file names {consolidates entity schemas with sample records from extraction outputs}
LLM Output structure: [schemaInference.json](./ai-integration/ai-prompt-output-schema/schemaInference.json)

#### Schema Inference limitations
Currently no transformation of fields is supported when mapping a field in a record to field in the canonical schema. Only 1:1 mapping is supported.

##### Future improvement
Add a transformation step before normalization which transforms fields as suggested by the LLM during canonical schema mapping generation, example:

    {
      "sourceFile": "statement.xlsx",
      "fieldName": "Spent",
      "canonical_field_name": "amount",
      "transformation": {
        "type": "sign_change",
        "expression": "-value"
      }
    }

controlling this output by only supporting a pre-defined set of transformations

### API design

#### Workspace CRUD API
Workspace is the identifier for a document processing workflow. Each enitity related to a workflow will get a workspaceID.

List: GET /api/v1/workspaces
Create: POST /api/v1/workspaces
Get by ID: GET /api/v1/workspaces/:workspaceId
Update: PUT /api/v1/workspaces/:workspaceId
Delete: DELETE /api/v1/workspaces/:workspaceId






















