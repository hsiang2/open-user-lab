/*
  Warnings:

  - The `manualDecision` column on the `FormAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[questionId,text]` on the table `FormOption` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ManualDecision" AS ENUM ('Pass', 'Fail', 'Unsure');

-- AlterTable
ALTER TABLE "public"."FormAnswer" DROP COLUMN "manualDecision",
ADD COLUMN     "manualDecision" "public"."ManualDecision";

-- AlterTable
ALTER TABLE "public"."FormQuestion" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."FormResponse" ADD COLUMN     "totalScore" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FormOption_questionId_text_key" ON "public"."FormOption"("questionId", "text");

-- CreateIndex
CREATE INDEX "FormResponse_formId_idx" ON "public"."FormResponse"("formId");

-- CreateIndex
CREATE INDEX "FormResponse_participationId_idx" ON "public"."FormResponse"("participationId");
