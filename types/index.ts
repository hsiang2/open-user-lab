import { 
  avatarSchema, 
  createStudyFullSchema, 
  criteriaUiSchema, 
  formSchema, 
  fullRecruitmentSchema, 
  insertCriteria, 
  insertParticipantWorkflowStep, 
  insertStudyWorkflowStep, 
  normalizedFormSchema, 
  optionInputSchema, 
  questionSchema, 
  userProfileSchema } from '@/lib/validators'
import { z } from 'zod'

export type RecruitmentFormValues = z.infer<typeof fullRecruitmentSchema>;

export type Criteria = z.infer<typeof insertCriteria> 

export type MatchLevel = "No Preference" | "Optional" | "Required";

export type CriteriaUiValues = z.infer<typeof criteriaUiSchema>;

export type ParticipantWorkflowStep = z.infer<typeof insertParticipantWorkflowStep> & {
    id: string
  order: number
};

export type StudyWorkflowStep = z.infer<typeof insertStudyWorkflowStep> & {
    id: string
  order: number
};

export type StudyFullInput = z.infer<typeof createStudyFullSchema>

export type StudyCreatePayload = Omit<
  StudyFullInput,
  "criteria"
> & {
  criteria: Array<z.infer<typeof insertCriteria>>;
};

export type AvatarInfo = z.infer<typeof avatarSchema>;

export type Profile = z.infer<typeof userProfileSchema>;

export type Certificate = {
  id: string;
  studyName: string;
  participantName: string;
  researcherName: string;
  image: string | null;
  message: string | null;
  avatarBaseParticipant: string | null;
  avatarAccessoryParticipant: string | null;
  avatarBaseResearcher: string | null;
  avatarAccessoryResearcher: string | null;
  createdAt: Date;
};

export type CheckResult = {
  ok: boolean;
  hasForm: boolean;
  missingRequired: string[];
  missingOptional: string[];
  requiredMismatches: string[];
  optionalMismatches: string[];
  reason?: string; 
};

// Form
export type OptionInput = z.infer<typeof optionInputSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type FormValues = z.infer<typeof formSchema>;
export type NormalizedFormPayload = z.infer<typeof normalizedFormSchema>;