/*
  Warnings:

  - Added the required column `assignedToId` to the `test_runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test_runs" ADD COLUMN     "assignedToId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
