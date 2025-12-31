-- CreateEnum
CREATE TYPE "TestRunExecutionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "test_runs" ADD COLUMN     "status" "TestRunExecutionStatus" NOT NULL DEFAULT 'IN_PROGRESS';
