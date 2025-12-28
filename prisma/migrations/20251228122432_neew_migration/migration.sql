/*
  Warnings:

  - You are about to drop the `project_behaviors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BehaviorScope" AS ENUM ('GLOBAL', 'MODULE');

-- DropForeignKey
ALTER TABLE "project_behaviors" DROP CONSTRAINT "project_behaviors_projectId_fkey";

-- DropTable
DROP TABLE "project_behaviors";

-- CreateTable
CREATE TABLE "ProjectBehavior" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleId" TEXT,
    "scope" "BehaviorScope" NOT NULL,
    "userAction" TEXT NOT NULL,
    "systemResult" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectBehavior_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectBehavior_projectId_idx" ON "ProjectBehavior"("projectId");

-- CreateIndex
CREATE INDEX "ProjectBehavior_moduleId_idx" ON "ProjectBehavior"("moduleId");

-- AddForeignKey
ALTER TABLE "ProjectBehavior" ADD CONSTRAINT "ProjectBehavior_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBehavior" ADD CONSTRAINT "ProjectBehavior_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
