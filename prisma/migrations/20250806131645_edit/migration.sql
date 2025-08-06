/*
  Warnings:

  - Added the required column `participantName` to the `ThankYouCertificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `researcherName` to the `ThankYouCertificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyName` to the `ThankYouCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ThankYouCertificate" ADD COLUMN     "participantName" TEXT NOT NULL,
ADD COLUMN     "researcherName" TEXT NOT NULL,
ADD COLUMN     "studyName" TEXT NOT NULL;
