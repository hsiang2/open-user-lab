/*
  Warnings:

  - The `value` column on the `Criteria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `language` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `background` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Criteria" DROP COLUMN "value",
ADD COLUMN     "value" TEXT[];

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "language",
ADD COLUMN     "language" TEXT[],
DROP COLUMN "background",
ADD COLUMN     "background" TEXT[];
