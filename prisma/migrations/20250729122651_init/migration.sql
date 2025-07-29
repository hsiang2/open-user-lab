-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('text', 'single_choice', 'multiple_choice');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('automatic', 'manual', 'none');

-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('draft', 'ongoing', 'ended');

-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('Applied', 'Invited', 'Selected', 'Rejected', 'Withdrawn', 'Completed');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('todo', 'completed');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "CriteriaMatchLevel" AS ENUM ('Required', 'Optional');

-- CreateEnum
CREATE TYPE "ProfileField" AS ENUM ('gender', 'language', 'region', 'background', 'birth');

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "StudyStatus" NOT NULL,
    "recruitmentStatus" "RecruitmentStatus" NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isResearcher" BOOLEAN NOT NULL DEFAULT false,
    "institution" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birth" TIMESTAMP(3),
    "gender" TEXT,
    "language" TEXT,
    "website" TEXT,
    "region" TEXT,
    "background" TEXT,
    "avatarBase" TEXT,
    "avatarAccessory" TEXT,
    "avatarBg" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL,
    "inviteStatus" "InviteStatus" NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantWorkflowStepStatus" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ParticipantWorkflowStepStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantWorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "noteResearcher" TEXT,
    "noteParticipant" TEXT,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "ParticipantWorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantWorkflow" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,

    CONSTRAINT "ParticipantWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyWorkflow" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,

    CONSTRAINT "StudyWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyWorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "note" TEXT,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "StudyWorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyWorkflowStepStatus" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudyWorkflowStepStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantSaved" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,

    CONSTRAINT "ParticipantSaved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySaved" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySaved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criteria" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "type" "ProfileField" NOT NULL,
    "value" TEXT NOT NULL,
    "matchLevel" "CriteriaMatchLevel" NOT NULL,

    CONSTRAINT "Criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "description" TEXT,
    "reward" TEXT,
    "format" TEXT,
    "duration" TEXT,
    "image" TEXT,
    "thankYouMessage" TEXT,

    CONSTRAINT "Recruitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "evaluationType" "EvaluationType" NOT NULL,

    CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "score" INTEGER,

    CONSTRAINT "FormOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT,

    CONSTRAINT "FormAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnswerSelectedOption" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "FormAnswerSelectedOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Study_slug_key" ON "Study"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_studyId_userId_key" ON "Collaborator"("studyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantWorkflow_studyId_key" ON "ParticipantWorkflow"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyWorkflow_studyId_key" ON "StudyWorkflow"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_studyId_key" ON "Recruitment"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Form_studyId_key" ON "Form"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAnswerSelectedOption_answerId_optionId_key" ON "FormAnswerSelectedOption"("answerId", "optionId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantWorkflowStepStatus" ADD CONSTRAINT "ParticipantWorkflowStepStatus_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ParticipantWorkflowStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantWorkflowStepStatus" ADD CONSTRAINT "ParticipantWorkflowStepStatus_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantWorkflowStep" ADD CONSTRAINT "ParticipantWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ParticipantWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantWorkflow" ADD CONSTRAINT "ParticipantWorkflow_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyWorkflow" ADD CONSTRAINT "StudyWorkflow_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyWorkflowStep" ADD CONSTRAINT "StudyWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "StudyWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyWorkflowStepStatus" ADD CONSTRAINT "StudyWorkflowStepStatus_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "StudyWorkflowStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSaved" ADD CONSTRAINT "ParticipantSaved_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSaved" ADD CONSTRAINT "ParticipantSaved_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySaved" ADD CONSTRAINT "StudySaved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySaved" ADD CONSTRAINT "StudySaved_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criteria" ADD CONSTRAINT "Criteria_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment" ADD CONSTRAINT "Recruitment_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormOption" ADD CONSTRAINT "FormOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswerSelectedOption" ADD CONSTRAINT "FormAnswerSelectedOption_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "FormAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswerSelectedOption" ADD CONSTRAINT "FormAnswerSelectedOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "FormOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
