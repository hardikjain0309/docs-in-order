/*
  Warnings:

  - Added the required column `updatedAt` to the `workspace` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkspaceState" AS ENUM ('DRAFT', 'FILES_UPLOADED', 'PARSING_COMPLETED', 'EXTRACTION_COMPLETED', 'SCHEMA_INFERRED', 'USER_CONFIRMED_SCHEMA', 'MAPPING_VALIDATION_COMPLETED', 'COMPLETED');

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "error" JSONB,
ADD COLUMN     "state" "WorkspaceState" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
