-- AlterEnum
ALTER TYPE "TestResultStatus" ADD VALUE IF NOT EXISTS 'UNTESTED';
-- AlterEnum
ALTER TYPE "TestRunExecutionStatus" ADD VALUE IF NOT EXISTS 'STARTED';

-- AlterTable
ALTER TABLE "test_results" ALTER COLUMN "status" SET DEFAULT 'UNTESTED';

-- AlterTable
ALTER TABLE "test_runs" ADD COLUMN     "setup" JSONB,
ALTER COLUMN "status" SET DEFAULT 'STARTED';
