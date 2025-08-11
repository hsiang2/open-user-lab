/*
  Warnings:

  - You are about to drop the column `avatarResearcher` on the `Recruitment` table. All the data in the column will be lost.
  - You are about to drop the column `avatarParticipant` on the `ThankYouCertificate` table. All the data in the column will be lost.
  - You are about to drop the column `avatarResearcher` on the `ThankYouCertificate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Recruitment" DROP COLUMN "avatarResearcher",
ADD COLUMN     "avatarAccessoryResearcher" TEXT,
ADD COLUMN     "avatarBaseResearcher" TEXT;

-- AlterTable
ALTER TABLE "public"."ThankYouCertificate" DROP COLUMN "avatarParticipant",
DROP COLUMN "avatarResearcher",
ADD COLUMN     "avatarAccessoryParticipant" TEXT,
ADD COLUMN     "avatarAccessoryResearcher" TEXT,
ADD COLUMN     "avatarBaseParticipant" TEXT,
ADD COLUMN     "avatarBaseResearcher" TEXT;
