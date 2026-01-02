/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");
