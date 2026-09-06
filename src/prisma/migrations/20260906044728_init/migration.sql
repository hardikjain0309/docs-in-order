-- CreateTable
CREATE TABLE "workspace" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'New Workspace'
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_id_key" ON "workspace"("id");
