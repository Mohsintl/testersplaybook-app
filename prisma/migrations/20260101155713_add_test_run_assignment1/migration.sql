-- DropForeignKey
ALTER TABLE "test_runs" DROP CONSTRAINT "test_runs_assignedToId_fkey";

-- AlterTable
ALTER TABLE "test_runs" ALTER COLUMN "assignedToId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
