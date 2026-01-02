/*
  Warnings:

  - Made the column `token` on table `invitations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "invitations" ALTER COLUMN "token" SET NOT NULL;
