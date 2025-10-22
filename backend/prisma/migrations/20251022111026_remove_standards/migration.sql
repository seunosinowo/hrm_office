/*
  Warnings:

  - You are about to drop the `Standard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Standard" DROP CONSTRAINT "Standard_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Standard" DROP CONSTRAINT "Standard_organizationId_fkey";

-- DropTable
DROP TABLE "Standard";
