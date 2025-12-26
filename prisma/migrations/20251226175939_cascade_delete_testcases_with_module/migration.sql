-- DropForeignKey
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_moduleId_fkey";

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
