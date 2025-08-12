-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "respondedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Invitation_studyId_status_idx" ON "public"."Invitation"("studyId", "status");

-- CreateIndex
CREATE INDEX "Invitation_userId_status_idx" ON "public"."Invitation"("userId", "status");
