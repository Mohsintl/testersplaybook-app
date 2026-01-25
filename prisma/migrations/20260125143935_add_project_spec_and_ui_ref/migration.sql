-- CreateEnum
CREATE TYPE "UIReferenceSource" AS ENUM ('FIGMA', 'SCREENSHOT', 'OTHER');

-- CreateTable
CREATE TABLE "product_specs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "overview" TEXT,
    "coreFlows" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_ui_references" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "source" "UIReferenceSource" NOT NULL DEFAULT 'SCREENSHOT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_ui_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_specs_projectId_key" ON "product_specs"("projectId");

-- CreateIndex
CREATE INDEX "project_ui_references_projectId_idx" ON "project_ui_references"("projectId");

-- AddForeignKey
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ui_references" ADD CONSTRAINT "project_ui_references_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
