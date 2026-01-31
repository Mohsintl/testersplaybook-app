/*
  Warnings:

  - You are about to drop the column `coreFlows` on the `product_specs` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `product_specs` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `product_specs` table. All the data in the column will be lost.
  - Added the required column `Content` to the `product_specs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "product_specs" ADD COLUMN "Content" TEXT DEFAULT ''::text;
-- or for JSON-like default:
-- ALTER TABLE "product_specs" ADD COLUMN "Content" TEXT DEFAULT '[]'::text;
ALTER TABLE "product_specs" DROP COLUMN "coreFlows",
DROP COLUMN "notes",
DROP COLUMN "overview",
ADD COLUMN     "Content" JSONB NOT NULL;
