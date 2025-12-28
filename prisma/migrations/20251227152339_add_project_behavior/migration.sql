-- CreateTable
CREATE TABLE "project_behaviors" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userAction" TEXT NOT NULL,
    "systemResult" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_behaviors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_behaviors" ADD CONSTRAINT "project_behaviors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
