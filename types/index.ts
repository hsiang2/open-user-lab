import { avatarSchema, insertStudySchema } from '@/lib/validators'
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

export type Avatar = z.infer<typeof avatarSchema>;