import { avatarSchema, createStudyFullSchema, criteriaUiSchema, fullRecruitmentSchema, insertCriteria, insertParticipantWorkflowStep, insertRecruitmentSchema, insertStudySchema, insertStudyWorkflowStep, recruitmentGoalSchema, userProfileSchema } from '@/lib/validators'
import { Description } from '@radix-ui/react-dialog';
import { z } from 'zod'

export type Study = z.infer<typeof insertStudySchema> & {
    id: string;
    createdAt: Date;
    slug:  string;

    // collaborators:          Collaborator[];
    // participations: Participation[];
    // participantSaved:     ParticipantSaved[];
    // participantWorkflow?:  ParticipantWorkflow;
    // studyWorkflow?:        StudyWorkflow;
    // criteria:              Criteria[];
    // recruitment?:           Recruitment;
    // form?:                  Form;
    // StudySaved: StudySaved[];
};

export type RecruitmentFormValues = z.infer<typeof fullRecruitmentSchema>;

// export type Recruitment = z.infer<typeof insertRecruitmentSchema> & {
//     id: string;
//     studyId: string;

//     description: string;
//     image: string;
//     avatarAccessoryResearcher: string;
//     avatarBaseResearcher: string;
//    thankYouMessage: string;
// };

export type Criteria = z.infer<typeof insertCriteria> & {
  //   id: string
  // studyId: string
};

export type MatchLevel = "No Preference" | "Optional" | "Required";

// export type CriteriaUiValues = {
//   gender: { matchLevel: MatchLevel; values: string[] };
//   background: { matchLevel: MatchLevel; values: string[] };
//   region: { matchLevel: MatchLevel; values: string[] };
//   language: { matchLevel: MatchLevel; values: string[] };
//   age: { matchLevel: MatchLevel; min?: number; max?: number };
// };
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

