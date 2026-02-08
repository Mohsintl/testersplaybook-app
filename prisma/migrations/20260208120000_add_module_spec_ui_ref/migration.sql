-- CreateTable
CREATE TABLE "module_specs" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_ui_references" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "source" "UIReferenceSource" NOT NULL DEFAULT 'SCREENSHOT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_ui_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_specs_moduleId_key" ON "module_specs"("moduleId");

-- CreateIndex
CREATE INDEX "module_ui_references_moduleId_idx" ON "module_ui_references"("moduleId");

-- AddForeignKey
ALTER TABLE "module_specs" ADD CONSTRAINT "module_specs_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_ui_references" ADD CONSTRAINT "module_ui_references_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
