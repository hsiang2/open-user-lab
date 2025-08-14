/*
  Warnings:

  - Made the column `appliedAt` on table `Participation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Participation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "appliedAt" SET NOT NULL,
ALTER COLUMN "appliedAt" SET DEFAULT CURRENT_TIMESTAMP;
