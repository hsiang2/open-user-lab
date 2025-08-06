import { avatarSchema, insertStudySchema, userProfileSchema } from '@/lib/validators'
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

export type AvatarInfo = z.infer<typeof avatarSchema>;

export type Profile = z.infer<typeof userProfileSchema>;