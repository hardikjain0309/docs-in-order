-- CreateTable
CREATE TABLE "schema" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "schema_fields" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "field_mappings" JSONB[] DEFAULT ARRAY[]::JSONB[]
);

-- CreateTable
CREATE TABLE "rawdata" (
    "workspaceId" UUID NOT NULL,
    "metadata" JSONB NOT NULL,
    "records" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "entityTypes" JSONB[] DEFAULT ARRAY[]::JSONB[]
);

-- CreateIndex
CREATE UNIQUE INDEX "schema_id_key" ON "schema"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rawdata_workspaceId_key" ON "rawdata"("workspaceId");

-- AddForeignKey
ALTER TABLE "schema" ADD CONSTRAINT "schema_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rawdata" ADD CONSTRAINT "rawdata_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
