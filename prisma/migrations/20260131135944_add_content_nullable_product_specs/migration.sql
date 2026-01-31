/*
  Warnings:

  - You are about to drop the column `Content` on the `product_specs` table. All the data in the column will be lost.
  - Added the required column `content` to the `product_specs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_specs" DROP COLUMN "Content",
ADD COLUMN     "content" JSONB NOT NULL;
