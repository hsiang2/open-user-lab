/*
  Warnings:

  - You are about to drop the column `duration` on the `Recruitment` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `Recruitment` table. All the data in the column will be lost.
  - The `format` column on the `Recruitment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Recruitment" DROP COLUMN "duration",
DROP COLUMN "reward",
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "formatOther" TEXT,
DROP COLUMN "format",
ADD COLUMN     "format" TEXT[];
