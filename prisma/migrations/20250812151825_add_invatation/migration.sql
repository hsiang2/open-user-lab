/*
  Warnings:

  - The values [Invited] on the enum `ParticipationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inviteStatus` on the `Participation` table. All the data in the column will be lost.
  - You are about to drop the column `invitedAt` on the `Participation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,studyId]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('pending', 'rejected', 'applied');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ParticipationStatus_new" AS ENUM ('Applied', 'Selected', 'Rejected', 'Withdrawn', 'Completed');
ALTER TABLE "public"."Participation" ALTER COLUMN "status" TYPE "public"."ParticipationStatus_new" USING ("status"::text::"public"."ParticipationStatus_new");
ALTER TYPE "public"."ParticipationStatus" RENAME TO "ParticipationStatus_old";
ALTER TYPE "public"."ParticipationStatus_new" RENAME TO "ParticipationStatus";
DROP TYPE "public"."ParticipationStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Participation" DROP COLUMN "inviteStatus",
DROP COLUMN "invitedAt";

-- DropEnum
DROP TYPE "public"."InviteStatus";

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_studyId_userId_key" ON "public"."Invitation"("studyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_studyId_key" ON "public"."Participation"("userId", "studyId");

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
