/*
  Warnings:

  - The values [GLOBAL] on the enum `BehaviorScope` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BehaviorScope_new" AS ENUM ('PROJECT', 'MODULE');
ALTER TABLE "ProjectBehavior" ALTER COLUMN "scope" TYPE "BehaviorScope_new" USING ("scope"::text::"BehaviorScope_new");
ALTER TYPE "BehaviorScope" RENAME TO "BehaviorScope_old";
ALTER TYPE "BehaviorScope_new" RENAME TO "BehaviorScope";
DROP TYPE "BehaviorScope_old";
COMMIT;
