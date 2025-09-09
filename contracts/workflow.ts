import type { Prisma, ParticipationStatus, StepStatus } from "@prisma/client";

export const PARTICIPANT_WORKFLOW_STEP_SELECT = {
  id: true,
  name: true,
  order: true,
  noteResearcher: true,
  noteParticipant: true,
  deadline: true,
} satisfies Prisma.ParticipantWorkflowStepSelect;

export type ParticipantWorkflowStepRaw =
  Prisma.ParticipantWorkflowStepGetPayload<{ select: typeof PARTICIPANT_WORKFLOW_STEP_SELECT }>;

export type ParticipantWorkflowStepDTO = {
  id: string;
  name: string;
  order: number;
  noteResearcher: string | null;
  noteParticipant: string | null;
  deadline: string | null; // ISO
};

export function mapParticipantStep(s: ParticipantWorkflowStepRaw): ParticipantWorkflowStepDTO {
  return {
    id: s.id,
    name: s.name,
    order: s.order,
    noteResearcher: s.noteResearcher ?? null,
    noteParticipant: s.noteParticipant ?? null,
    deadline: s.deadline ? s.deadline.toISOString() : null,
  };
}

export const PARTICIPATION_PROGRESS_SELECT = {
  id: true,
  status: true,
  user: { select: { id: true, name: true } },
  workflowStepStatuses: {
    select: { id: true, stepId: true, status: true, completedAt: true },
  },
} satisfies Prisma.ParticipationSelect;

export type ParticipationProgressRaw =
  Prisma.ParticipationGetPayload<{ select: typeof PARTICIPATION_PROGRESS_SELECT }>;

export type ParticipantProgressRow = {
  participationId: string;
  participationStatus: ParticipationStatus;
  user: { id: string; name: string | null };
  statuses: Array<{
    stepId: string;
    statusId?: string;
    status: StepStatus;
    completedAt?: string | null;
  }>;
};

export function mapParticipationToProgressRow(
  p: ParticipationProgressRaw,
  orderedStepIds: string[]
): ParticipantProgressRow {
  const byStep = new Map(p.workflowStepStatuses.map(s => [s.stepId, s]));
  const statuses = orderedStepIds.map(stepId => {
    const s = byStep.get(stepId);
    return s
      ? {
          stepId,
          statusId: s.id,
          status: s.status,
          completedAt: s.completedAt ? s.completedAt.toISOString() : null,
        }
      : { stepId, status: "todo" as StepStatus };
  });
  return {
    participationId: p.id,
    participationStatus: p.status,
    user: { id: p.user.id, name: p.user.name },
    statuses,
  };
}


export const STUDY_WORKFLOW_STEP_SELECT = {
  id: true,
  name: true,
  order: true,
  note: true,
  deadline: true,
} satisfies Prisma.StudyWorkflowStepSelect;

type StudyStepRaw = Prisma.StudyWorkflowStepGetPayload<{
  select: typeof STUDY_WORKFLOW_STEP_SELECT;
}>;

export type StudyStepDTO = {
  id: string;
  order: number;
  name: string;
  note: string | null;
  deadline: string | null; // ISO
};

export type StudyStepStatusDTO = {
  stepId: string;
  status: StepStatus; // "todo" | "completed"
};

/** Raw -> DTO（Date to ISO） */
export function mapStudyStep(raw: StudyStepRaw): StudyStepDTO {
  return {
    id: raw.id,
    name: raw.name,
    order: raw.order,
    note: raw.note ?? null,
    deadline: raw.deadline ? raw.deadline.toISOString() : null,
  };
}