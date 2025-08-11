-- AlterTable
ALTER TABLE "public"."Recruitment" ADD COLUMN     "autoCloseApplicantCount" INTEGER,
ADD COLUMN     "autoCloseDate" TIMESTAMP(3),
ADD COLUMN     "autoCloseSelectedCount" INTEGER;
