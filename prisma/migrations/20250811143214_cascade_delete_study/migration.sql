-- DropForeignKey
ALTER TABLE "public"."Collaborator" DROP CONSTRAINT "Collaborator_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Criteria" DROP CONSTRAINT "Criteria_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Form" DROP CONSTRAINT "Form_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormAnswer" DROP CONSTRAINT "FormAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormAnswer" DROP CONSTRAINT "FormAnswer_responseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormAnswerSelectedOption" DROP CONSTRAINT "FormAnswerSelectedOption_answerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormAnswerSelectedOption" DROP CONSTRAINT "FormAnswerSelectedOption_optionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormOption" DROP CONSTRAINT "FormOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormQuestion" DROP CONSTRAINT "FormQuestion_formId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormResponse" DROP CONSTRAINT "FormResponse_formId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormResponse" DROP CONSTRAINT "FormResponse_participationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipantSaved" DROP CONSTRAINT "ParticipantSaved_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipantWorkflow" DROP CONSTRAINT "ParticipantWorkflow_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipantWorkflowStep" DROP CONSTRAINT "ParticipantWorkflowStep_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipantWorkflowStepStatus" DROP CONSTRAINT "ParticipantWorkflowStepStatus_participationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipantWorkflowStepStatus" DROP CONSTRAINT "ParticipantWorkflowStepStatus_stepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Participation" DROP CONSTRAINT "Participation_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recruitment" DROP CONSTRAINT "Recruitment_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudySaved" DROP CONSTRAINT "StudySaved_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyWorkflow" DROP CONSTRAINT "StudyWorkflow_studyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyWorkflowStep" DROP CONSTRAINT "StudyWorkflowStep_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyWorkflowStepStatus" DROP CONSTRAINT "StudyWorkflowStepStatus_stepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ThankYouCertificate" DROP CONSTRAINT "ThankYouCertificate_participationId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Collaborator" ADD CONSTRAINT "Collaborator_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participation" ADD CONSTRAINT "Participation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipantWorkflowStepStatus" ADD CONSTRAINT "ParticipantWorkflowStepStatus_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."ParticipantWorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipantWorkflowStepStatus" ADD CONSTRAINT "ParticipantWorkflowStepStatus_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "public"."Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipantWorkflowStep" ADD CONSTRAINT "ParticipantWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."ParticipantWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipantWorkflow" ADD CONSTRAINT "ParticipantWorkflow_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyWorkflow" ADD CONSTRAINT "StudyWorkflow_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyWorkflowStep" ADD CONSTRAINT "StudyWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."StudyWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyWorkflowStepStatus" ADD CONSTRAINT "StudyWorkflowStepStatus_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."StudyWorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipantSaved" ADD CONSTRAINT "ParticipantSaved_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudySaved" ADD CONSTRAINT "StudySaved_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Criteria" ADD CONSTRAINT "Criteria_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recruitment" ADD CONSTRAINT "Recruitment_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Form" ADD CONSTRAINT "Form_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormQuestion" ADD CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormOption" ADD CONSTRAINT "FormOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormResponse" ADD CONSTRAINT "FormResponse_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "public"."Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormAnswer" ADD CONSTRAINT "FormAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "public"."FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormAnswer" ADD CONSTRAINT "FormAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormAnswerSelectedOption" ADD CONSTRAINT "FormAnswerSelectedOption_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "public"."FormAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormAnswerSelectedOption" ADD CONSTRAINT "FormAnswerSelectedOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."FormOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThankYouCertificate" ADD CONSTRAINT "ThankYouCertificate_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "public"."Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
