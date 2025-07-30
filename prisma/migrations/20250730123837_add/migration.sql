-- AlterTable
ALTER TABLE "Recruitment" ADD COLUMN     "avatarResearcher" TEXT,
ADD COLUMN     "criteriaDescription" TEXT,
ADD COLUMN     "sessionDetail" TEXT;

-- CreateTable
CREATE TABLE "ThankYouCertificate" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "image" TEXT,
    "message" TEXT,
    "avatarParticipant" TEXT,
    "avatarResearcher" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThankYouCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThankYouCertificate_participationId_key" ON "ThankYouCertificate"("participationId");

-- AddForeignKey
ALTER TABLE "ThankYouCertificate" ADD CONSTRAINT "ThankYouCertificate_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
