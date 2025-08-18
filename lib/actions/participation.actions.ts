'use server'

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CheckResult, NormalizedFormPayload } from "@/types";
import { Criterion, evaluate } from "./eligibility";
import { CollaboratorRole, ParticipationStatus, QuestionType, RecruitmentStatus, StepStatus, StudyStatus } from "@prisma/client";
import { normalizedFormSchema } from "../validators";
import { revalidatePath } from "next/cache";import { redirect } from "next/navigation";
import { mapParticipantStep, mapParticipationToProgressRow, mapStudyStep, PARTICIPANT_WORKFLOW_STEP_SELECT, ParticipantProgressRow, ParticipantWorkflowStepDTO, PARTICIPATION_PROGRESS_SELECT, STUDY_WORKFLOW_STEP_SELECT, StudyStepDTO, StudyStepStatusDTO } from "@/contracts/workflow";
import { PROFILE_FOR_EVAL_SELECT } from "@/contracts/user";
import { PotentialParticipantItem, USER_FOR_POTENTIAL_SELECT } from "@/contracts/potential-participant";
;

export async function checkStudyEligibility(slug: string): Promise<CheckResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      ok: false,
      hasForm: false,
      missingRequired: [],
      missingOptional: [],
      requiredMismatches: [],
      optionalMismatches: [],
      reason: "Unauthenticated",
    };
  }

  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      form: { select: { id: true } },
      criteria: { select: { type: true, value: true, matchLevel: true } },
    },
  });
  if (!study) {
    return {
      ok: false,
      hasForm: false,
      missingRequired: [],
      missingOptional: [],
      requiredMismatches: [],
      optionalMismatches: [],
      reason: "Study not found",
    };
  }

  // 允許 profile 為 null，讓 evaluate 判定 missing
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { ...PROFILE_FOR_EVAL_SELECT },
  });

  const breakdown = evaluate(profile, study.criteria as Criterion[]);
  const { ok, missingRequired, missingOptional, requiredMismatches, optionalMismatches } = breakdown;

  const hasForm = !!study.form?.id;

  if (!ok) {
    return {
      ok: false,
      hasForm,
      missingRequired,
      missingOptional,
      requiredMismatches,
      optionalMismatches,
      reason: "Not eligible",
    };
  }

  return {
    ok: true,
    hasForm,
    missingRequired,
    missingOptional,
    requiredMismatches,
    optionalMismatches,
    // 保持與既有型別一致：這裡不回傳 score/requiredMatched 等前端用不到的欄位
  };
}

export async function applyDirectly(slug: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({
    where: { slug },
    select: { id: true, recruitmentStatus: true, status: true },
  });
  if (!study) throw new Error("Study not found");
  if (study.status !== "ongoing" || study.recruitmentStatus !== "open") {
    throw new Error("Recruitment is not open");
  }

  // 不重複申請
  const existed = await prisma.participation.findFirst({
    where: { userId, studyId: study.id },
    select: { id: true },
  });
  if (existed) return { ok: true, already: true };

  // 建立 participation
  await prisma.participation.create({
    data: {
      userId,
      studyId: study.id,
      status: "Applied",
      appliedAt: new Date(),
    },
  });

  // 看看是否有 pending 邀請
  const inv = await prisma.invitation.findFirst({
    where: { studyId: study.id, userId, status: "pending" },
    select: { id: true },
  });

if (inv) {
    await prisma.invitation.update({
        where: { id: inv.id },
        data: { status: "applied", respondedAt: new Date() },
        });
}

  return { ok: true, already: false };
}

export async function declineInvitationById(invitationId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  // 只允許本人操作自己的邀請
  const inv = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { userId: true, status: true },
  });
  if (!inv || inv.userId !== userId) throw new Error("Not allowed");
  if (inv.status !== "pending") return { ok: true }; // 已處理過

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "rejected", respondedAt: new Date() },
  });

  return { ok: true };
}

// Get participants progress

export async function listInvitationsForStudy(slug: string) {
  const study = await prisma.study.findUnique({ where: { slug }, select: { id: true } });
  if (!study) return [];

  return prisma.invitation.findMany({
    where: { studyId: study.id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type ManualDecision = "Pass" | "Fail" | "Unsure" | null;

export type AppliedParticipantRow = {
  id: string;                // participationId
  status: "Applied" | "Selected" | "Rejected" | "Withdrawn" | "Completed";
  appliedAt: Date | null;
  updatedAt: Date;

  user: {
    id: string;
    name: string;
    profile: {
      gender: string | null;
      language: string[] | null;
      region: string | null;
      background: string[] | null;
      birth: Date | null;
      avatarBase: string | null;
      avatarAccessory: string | null;
      avatarBg: string | null;
    } | null;
  };

  // Criteria breakdown 直接丟前端，讓你畫 v / x / ? 或打開彈窗看細節
  criteria: ReturnType<typeof evaluate>;

  // 問卷部分（可能整個空，因為 allow no-form）
  form: {
    responseId: string | null;
    submittedAt: Date | null;
    totalScore: number; // 沒表單=0
    manual: {
      counts: { pass: number; fail: number; unsure: number; total: number };
      answers: Array<{
        answerId: string;
        questionId: string;
        questionText: string;
        manualDecision: ManualDecision;
        type: "text" | "single_choice" | "multiple_choice";
        textAnswer?: string | null;
        selectedOptions?: Array<{ id: string; text: string; score: number | null }>;
      }>;
    };
    scored: {
      answers: Array<{
        answerId: string;
        questionId: string;
        questionText: string;
        type: "single_choice" | "multiple_choice";
        selectedOptions: Array<{ id: string; text: string; score: number | null }>;
        questionScore: number; // 這一題加總
      }>;
    };
    unscored: {
      count: number;
      answers: Array<{
        answerId: string;
        questionId: string;
        questionText: string;
        type: "text" | "single_choice" | "multiple_choice";
        textAnswer?: string | null;
        selectedOptions?: Array<{ id: string; text: string }>;
      }>;
    };
  };
};

export type ApplicantSort =
  | "score_desc"
  | "score_asc"
  | "manual_pass_desc"
  | "criteria_desc"
  | "applied_newest"
  | "applied_oldest"
  | "name_az";

export async function listAppliedParticipants(
  slug: string,
  opts?: { sort?: ApplicantSort }
): Promise<AppliedParticipantRow[]> {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      criteria: { select: { type: true, value: true, matchLevel: true } },
      participations: {
        where: { status: "Applied" },
        orderBy: { appliedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  gender: true,
                  language: true,
                  region: true,
                  background: true,
                  birth: true,
                  avatarBase: true,
                  avatarAccessory: true,
                  avatarBg: true,
                },
              },
            },
          },
          formResponses: {
            orderBy: { submittedAt: "desc" },
            take: 1,
            select: {
              id: true,
              submittedAt: true,
              totalScore: true,
              answers: {
                select: {
                  id: true,
                  text: true,
                  manualDecision: true,
                  question: {
                    select: {
                      id: true,
                      text: true,
                      type: true,
                      evaluationType: true,
                      options: { select: { id: true, text: true, score: true } },
                    },
                  },
                  selectedOptions: {
                    select: { option: { select: { id: true, text: true, score: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!study) throw new Error("Study not found");

  const prevRows = study.participations.map((p) => {
    const breakdown = evaluate(p.user.profile, study.criteria as unknown as Criterion[]);

    const resp = p.formResponses[0] ?? null;
    const answers = resp?.answers ?? [];

    // 分三類
    const manualAnswers = answers.filter(a => a.question.evaluationType === "manual");
    const scoredAnswers = answers.filter(a => a.question.evaluationType === "automatic");
    const unscoredAnswers = answers.filter(a => a.question.evaluationType === "none");

    // 手動審核計數
    const manualCounts = {
      pass: manualAnswers.filter(a => a.manualDecision === "Pass").length,
      fail: manualAnswers.filter(a => a.manualDecision === "Fail").length,
      unsure: manualAnswers.filter(a => a.manualDecision === "Unsure" || a.manualDecision === null).length,
      total: manualAnswers.length,
    };

    // 自動評分：以 response.totalScore 為主，沒有就用選項分數加總
    const fallbackScore = scoredAnswers.reduce((sum, a) => {
      const s = a.selectedOptions.reduce((s2, sel) => s2 + (sel.option.score ?? 0), 0);
      return sum + s;
    }, 0);
    const totalScore = resp?.totalScore ?? fallbackScore;

    return {
      id: p.id,
      status: p.status as AppliedParticipantRow["status"],
      appliedAt: p.appliedAt,
      updatedAt: p.updatedAt,
      user: {
        id: p.user.id,
        name: p.user.name,
        profile: p.user.profile
          ? {
              gender: p.user.profile.gender ?? null,
              language: p.user.profile.language ?? null,
              region: p.user.profile.region ?? null,
              background: p.user.profile.background ?? null,
              birth: p.user.profile.birth ?? null,
              avatarBase: p.user.profile.avatarBase ?? null,
              avatarAccessory: p.user.profile.avatarAccessory ?? null,
              avatarBg: p.user.profile.avatarBg ?? null,
            }
          : null,
      },
      criteria: breakdown,
      form: {
        responseId: resp?.id ?? null,
        submittedAt: resp?.submittedAt ?? null,
        totalScore,
        manual: {
          counts: manualCounts,
          answers: manualAnswers.map(a => ({
            answerId: a.id,
            questionId: a.question.id,
            questionText: a.question.text,
            manualDecision: a.manualDecision as ManualDecision,
            type: a.question.type,
            textAnswer: a.text,
            selectedOptions:
              a.selectedOptions.length
                ? a.selectedOptions.map(s => ({
                    id: s.option.id,
                    text: s.option.text,
                    score: s.option.score,
                  }))
                : undefined,
          })),
        },
        scored: {
          answers: scoredAnswers.map(a => {
            const selected = a.selectedOptions.map(s => ({
              id: s.option.id,
              text: s.option.text,
              score: s.option.score,
            }));
            const qScore = selected.reduce((s, o) => s + (o.score ?? 0), 0);
            return {
              answerId: a.id,
              questionId: a.question.id,
              questionText: a.question.text,
              type: a.question.type as "single_choice" | "multiple_choice",
              selectedOptions: selected,
              questionScore: qScore,
            };
          }),
        },
        unscored: {
          count: unscoredAnswers.length,
          answers: unscoredAnswers.map(a => ({
            answerId: a.id,
            questionId: a.question.id,
            questionText: a.question.text,
            type: a.question.type,
            textAnswer: a.text ?? undefined,
            selectedOptions:
              a.selectedOptions.length
                ? a.selectedOptions.map(s => ({ id: s.option.id, text: s.option.text }))
                : undefined,
          })),
        },
      },
    };
  });

   const sort = opts?.sort ?? "score_desc";

  const getScore = (r: AppliedParticipantRow) => Number(r.form?.totalScore ?? 0);
  const getManualPass = (r: AppliedParticipantRow) => Number(r.form?.manual?.counts?.pass ?? 0);
  const getCriteria = (r: AppliedParticipantRow) => Number(r.criteria?.score ?? 0);
  const getAppliedAt = (r: AppliedParticipantRow) => (r.appliedAt ? new Date(r.appliedAt).getTime() : 0);
  const cmp = (n: number) => (n < 0 ? -1 : n > 0 ? 1 : 0);

  const rows = [...prevRows].sort((a, b) => {
    switch (sort) {
      case "score_desc":
        return (
          cmp(getScore(b) - getScore(a)) ||
          cmp(getAppliedAt(b) - getAppliedAt(a))
        );
      case "score_asc":
        return (
          cmp(getScore(a) - getScore(b)) ||
          cmp(getAppliedAt(b) - getAppliedAt(a))
        );
      case "manual_pass_desc":
        return (
          cmp(getManualPass(b) - getManualPass(a)) ||
          cmp(getAppliedAt(b) - getAppliedAt(a))
        );
      case "criteria_desc":
        return (
          cmp(getCriteria(b) - getCriteria(a)) ||
          cmp(getAppliedAt(b) - getAppliedAt(a))
        );
      case "applied_newest":
        return cmp(getAppliedAt(b) - getAppliedAt(a));
      case "applied_oldest":
        return cmp(getAppliedAt(a) - getAppliedAt(b));
      case "name_az":
        return a.user.name.localeCompare(b.user.name);
      default:
        return 0;
    }
  });

  return rows;

}

export async function updateManualDecisions(input: {
  participationId: string;
  slug: string;
  decisions: Array<{ answerId: string; decision: "Pass" | "Fail" | "Unsure" | null }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  // 找到 participation → studyId
  const part = await prisma.participation.findUnique({
    where: { id: input.participationId },
    select: { studyId: true },
  });
  if (!part) throw new Error("Participation not found");

  // 權限：必須是 owner/editor
  const collab = await prisma.collaborator.findFirst({
    where: { studyId: part.studyId, userId, role: { in: ["owner", "editor"] } },
    select: { id: true },
  });
  if (!collab) throw new Error("Not allowed");

  await prisma.$transaction(async (tx) => {
    for (const d of input.decisions) {
      await tx.formAnswer.update({
        where: { id: d.answerId },
        data: { manualDecision: d.decision },
      });
    }
  });

  revalidatePath(`/my-studies/view/${input.slug}/participant-progress`);

  return { ok: true };
}


export async function listSelectedParticipantProgress(slug: string): Promise<{
  steps: ParticipantWorkflowStepDTO[];
  progress: ParticipantProgressRow[];
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      participantWorkflow: {
        select: { steps: { select: PARTICIPANT_WORKFLOW_STEP_SELECT, orderBy: { order: "asc" } } },
      },
    },
  });
  if (!study) throw new Error("Study not found");

  const steps = (study.participantWorkflow?.steps ?? []).map(mapParticipantStep);
  const stepIds = steps.map(s => s.id);

  const parts = await prisma.participation.findMany({
    where: { studyId: study.id, status: { in: ["Selected", "Completed"] } },
    select: PARTICIPATION_PROGRESS_SELECT,
    orderBy: { updatedAt: "desc" },
  });

  const progress = parts.map(p => mapParticipationToProgressRow(p, stepIds));
  return { steps, progress };
}

// export type WorkflowStepDTO = {
//   id: string;
//   name: string;
//   order: number;
//   noteResearcher: string | null;
//   noteParticipant: string | null;
//   deadline: string | null; // ISO
// };

// export type RowDTO = {
//   participationId: string;
//   participationStatus: ParticipationStatus;
//   user: { id: string; name: string | null };
//   statuses: Array<{
//     stepId: string;
//     statusId?: string;
//     status: StepStatus;
//     completedAt?: string | null;
//   }>;
// };

// export async function listSelectedWithWorkflow(slug: string): Promise<{
//   steps: WorkflowStepDTO[];
//   rows: RowDTO[];
// }> {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error("Unauthenticated");

//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: {
//       id: true,
//       participantWorkflow: {
//         select: {
//           steps: {
//             select: {
//               id: true,
//               name: true,
//               order: true,
//               noteResearcher: true,
//               noteParticipant: true,
//               deadline: true,
//             },
//             orderBy: { order: "asc" },
//           },
//         },
//       },
//     },
//   });
//   if (!study) throw new Error("Study not found");

//   const steps: WorkflowStepDTO[] =
//     (study.participantWorkflow?.steps ?? []).map(s => ({
//       id: s.id,
//       name: s.name,
//       order: s.order,
//       noteResearcher: s.noteResearcher ?? null,
//       noteParticipant: s.noteParticipant ?? null,
//       deadline: s.deadline ? s.deadline.toISOString() : null,
//     }));

//   const parts = await prisma.participation.findMany({
//     where: { studyId: study.id, status: { in: ["Selected", "Completed"] } },
//     select: {
//       id: true,
//       status: true,
//       user: { select: { id: true, name: true } },
//       workflowStepStatuses: {
//         select: { id: true, status: true, completedAt: true, stepId: true },
//       },
//     },
//     orderBy: { updatedAt: "desc" },
//   });

//   const rows: RowDTO[] = parts.map(p => {
//     const map = new Map(p.workflowStepStatuses.map(s => [s.stepId, s]));
//     const statuses = steps.map(st => {
//       const hit = map.get(st.id);
//       return hit
//         ? {
//             stepId: st.id,
//             statusId: hit.id,
//             status: hit.status,
//             completedAt: hit.completedAt?.toISOString() ?? null,
//           }
//         : { stepId: st.id, status: "todo" as StepStatus };
//     });
//     return { participationId: p.id, participationStatus: p.status, user: p.user, statuses };
//   });

//   return { steps, rows };
// }




export async function setParticipantStepStatus(params: {
  participationId: string;
  stepId: string;
  status: StepStatus;         
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  const { participationId, stepId, status } = params;

  // 先找有沒有現成的 status 記錄
  const exist = await prisma.participantWorkflowStepStatus.findFirst({
    where: { participationId, stepId },
    select: { id: true },
  });

  if (exist) {
    await prisma.participantWorkflowStepStatus.update({
      where: { id: exist.id },
      data: {
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
    });
  } else {
    await prisma.participantWorkflowStepStatus.create({
      data: {
        participationId,
        stepId,
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
    });
  }

  return { ok: true };
}


export async function getStudyWorkflowForSlug(slug: string): Promise<{
  studyId: string;
  steps: StudyStepDTO[];
  statuses: StudyStepStatusDTO[];
}> {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      studyWorkflow: {
        select: {
          steps: { select: STUDY_WORKFLOW_STEP_SELECT, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!study) throw new Error("Study not found");

  // 還沒建立 workflow → 回傳空
  if (!study.studyWorkflow) {
    return { studyId: study.id, steps: [], statuses: [] };
  }

  const steps: StudyStepDTO[] = study.studyWorkflow.steps.map(mapStudyStep);
  const stepIds = steps.map(s => s.id);

  // 取現有狀態
  const existed = await prisma.studyWorkflowStepStatus.findMany({
    where: { studyId: study.id },
    select: { stepId: true, status: true },
  });
  const existedMap = new Map(existed.map(x => [x.stepId, x.status]));

  // 補缺的狀態 → 建立為 todo（保留你原來邏輯）
  const missing = stepIds.filter(id => !existedMap.has(id));
  if (missing.length) {
    await prisma.studyWorkflowStepStatus.createMany({
      data: missing.map(stepId => ({
        studyId: study.id,
        stepId,
        status: "todo",
        completedAt: null,
      })),
    });
  }

  // 組合輸出（保證每個 step 都有一筆）
  const statuses: StudyStepStatusDTO[] = stepIds.map(stepId => ({
    stepId,
    status: existedMap.get(stepId) ?? "todo",
  }));

  return { studyId: study.id, steps, statuses };
}


// export type StudyStepDTO = {
//   id: string;
//   name: string;
//   order: number;
//   note: string | null;
//   deadline: string | null; // ISO
// };

// export type StudyStepStatusDTO = {
//   stepId: string;
//   status: "todo" | "completed";
// };

// export async function getStudyWorkflowForSlug(slug: string): Promise<{
//   studyId: string;
//   steps: StudyStepDTO[];
//   statuses: StudyStepStatusDTO[];
// }> {
//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: {
//       id: true,
//       slug: true,
//       studyWorkflow: {
//         include: {
//           steps: { orderBy: { order: "asc" } },
//         },
//       },
//     },
//   });

//   if (!study) throw new Error("Study not found");

//   // 可能還沒建立 studyWorkflow → 回傳空
//   if (!study.studyWorkflow) {
//     return { studyId: study.id, steps: [], statuses: [] };
//   }

//   const steps = study.studyWorkflow.steps.map<StudyStepDTO>((s) => ({
//     id: s.id,
//     order: s.order,
//     name: s.name,
//     note: s.note ?? null,
//     deadline: s.deadline ? s.deadline.toISOString() : null,
//   }));

//   // 取現有狀態
//   const existed = await prisma.studyWorkflowStepStatus.findMany({
//     where: { studyId: study.id },
//     select: { stepId: true, status: true },
//   });
//   const existedMap = new Map(existed.map((x) => [x.stepId, x.status]));

//   // 找出缺的狀態 → 建立為 todo
//   const missing = steps.filter((s) => !existedMap.has(s.id));
//   if (missing.length) {
//     await prisma.studyWorkflowStepStatus.createMany({
//       data: missing.map((m) => ({
//         studyId: study.id,
//         stepId: m.id,
//         status: "todo",
//         completedAt: null,
//       })),
//     });
//   }

//   // 重新組合（保證每個 step 都有一筆）
//   const statuses: StudyStepStatusDTO[] = steps.map((s) => ({
//     stepId: s.id,
//     status: (existedMap.get(s.id) ?? "todo") as "todo" | "completed",
//   }));

//   return { studyId: study.id, steps, statuses };
// }


// 切換 study workflow 的步驟狀態
export async function setStudyStepStatus(input: {
  studyId: string;
  stepId: string;
  status: "todo" | "completed";
  revalidateTo?: string; // e.g. `/recruitment/[slug]`
}) {
  "use server"; // ← 如果要在 client 直接 import 這個函式呼叫，務必加在函式內

  const { studyId, stepId, status, revalidateTo } = input;

  // 1) 認證
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  // 2) 權限：owner/editor 才能改
  const collab = await prisma.collaborator.findFirst({
    where: { studyId, userId, role: { in: ["owner", "editor"] } },
    select: { id: true },
  });
  if (!collab) throw new Error("Not allowed");

  // 3) 防呆：確認 stepId 屬於此 study 的 workflow
  const step = await prisma.studyWorkflowStep.findUnique({
    where: { id: stepId },
    select: { workflow: { select: { studyId: true } } },
  });
  if (!step || step.workflow.studyId !== studyId) {
    throw new Error("Invalid step");
  }

  // 4) upsert（無複合 unique 的情況下：先查再決定 update/create）
  const existing = await prisma.studyWorkflowStepStatus.findFirst({
    where: { stepId, studyId },
    select: { id: true },
  });

  const now = new Date();
  const completedAt = status === "completed" ? now : null;

  if (existing) {
    await prisma.studyWorkflowStepStatus.update({
      where: { id: existing.id }, // 只能用唯一鍵 id
      data: { status, completedAt },
    });
  } else {
    await prisma.studyWorkflowStepStatus.create({
      data: { studyId, stepId, status, completedAt },
    });
  }

  if (revalidateTo) revalidatePath(revalidateTo);

  return { ok: true };
}

//之後補測：
// export async function updateWorkflowStepMeta(params: {
//   stepId: string;
//   noteResearcher?: string | null;
//   noteParticipant?: string | null;
//   deadline?: string | null; // ISO or null
// }) {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error("Unauthenticated");

//   const { stepId, noteResearcher, noteParticipant, deadline } = params;

//   await prisma.participantWorkflowStep.update({
//     where: { id: stepId },
//     data: {
//       noteResearcher: noteResearcher ?? undefined,
//       noteParticipant: noteParticipant ?? undefined,
//       deadline: typeof deadline === "string" ? new Date(deadline) : deadline === null ? null : undefined,
//     },
//   });

//   return { ok: true };
// }



// export async function listAppliedParticipants( slug: string) {
//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: { id: true },
//   });
//   if (!study) throw new Error("Study not found");

//   return prisma.participation.findMany({
//     where: {
//       studyId: study.id,
//       status: "Applied",
//     },
//     select: {
//       id: true,
//       status: true,
//       appliedAt: true,
//       updatedAt: true,
//       user: { select: { id: true, name: true } },
//       formResponses: {
//         select: {
//           id: true,
//           submittedAt: true,
//           answers: {
//             select: {
//               id: true,
//               text: true,
//               question: {
//                 select: {
//                   id: true,
//                   text: true,
//                   evaluationType: true,
//                   options: { select: { id: true, text: true, score: true } },
//                 },
//               },
//               selectedOptions: {
//                 select: { option: { select: { id: true, text: true, score: true } } },
//               },
//             },
//           },
//         },
//       },
//     },
//     orderBy: { updatedAt: "desc" },
//     // take: take + 1,
//     // ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
//   });

//   // const items = rows.slice(0, take);
//   // const nextCursor = rows.length > take ? items[items.length - 1].id : undefined;

//   // return { items, nextCursor };
// }





//Get potential participants
 
// 依「Required criteria」建立 DB 過濾條件
function buildRequiredWhere(criteria: Criterion[]) {
  const ands = [];

  for (const c of criteria) {
    if (c.matchLevel !== "Required") continue;

    switch (c.type) {
      case "gender":
        ands.push({ gender: { in: c.value } });
        break;

      case "region":
        ands.push({ region: { in: c.value } });
        break;

      case "language":
        ands.push({ language: { hasSome: c.value } });
        break;

      case "background":
        ands.push({ background: { hasSome: c.value } });
        break;

      case "birth": {
        const [minStr, maxStr] = c.value;
        const min = Number(minStr);
        const max = Number(maxStr);

        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          const now = new Date();
          // 年齡 max 對應的最老生日起點
          const oldest = new Date(now);
          oldest.setFullYear(now.getFullYear() - max - 1);
          oldest.setMonth(11, 31);
          // 年齡 min 對應的最年輕生日終點
          const youngest = new Date(now);
          youngest.setFullYear(now.getFullYear() - min);
          ands.push({ birth: { gte: oldest, lte: youngest } });
        } else {
          // 邊界無法解析，至少要求「有填生日」
          ands.push({ birth: { not: null } });
        }
        break;
      }

      default:
        // 未實作的 Required 類型，至少要求「有填」，避免放進候選名單
        ands.push({ [c.type]: { not: null } });
        break;
    }
  }

  // 若沒有任何 Required，至少要求有 profile
  return ands.length
    ? { profile: { is: { AND: ands } } }
    : { profile: { isNot: null } };
}

// 1) 候選清單
export async function listPotentialParticipantsForStudy(params: {
  slug: string;
  take?: number;
  cursor?: string;
}): Promise<{ items: PotentialParticipantItem[]; nextCursor?: string }>  {
  const { slug, take = 20, cursor, 
    // sortBy = "best" 
  } = params;

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      criteria: { select: { type: true, value: true, matchLevel: true } },
    },
  });
  if (!study) throw new Error("Study not found");

  // 排除已在案或已邀的人
  const [ps, invs] = await Promise.all([
    prisma.participation.findMany({ where: { studyId: study.id }, select: { userId: true } }),
    prisma.invitation.findMany({
      where: { studyId: study.id, status: { in: ["pending", "applied"] } },
      select: { userId: true },
    }),
  ]);
  const excluded = Array.from(new Set([...ps.map(p => p.userId), ...invs.map(i => i.userId)]));

  const requiredWhere = buildRequiredWhere(study.criteria as Criterion[]);

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: excluded },
      ...requiredWhere,
    },
     select: USER_FOR_POTENTIAL_SELECT,
    // select: {
    //   id: true,
    //   name: true,
    //   profile: {
    //     select: { 
    //        ...PROFILE_FOR_EVAL_SELECT,        

    //       avatarBase : true, 
    //       avatarAccessory: true, 
    //       avatarBg: true, 
    //     },
    //   },
    // },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const items: PotentialParticipantItem[]  = users.map(u => {
    const breakdown = evaluate(u.profile, study.criteria as Criterion[]);
    return {
      userId: u.id,
      name: u.name,
      avatarBase : u.profile?.avatarBase ?? null, 
      avatarAccessory: u.profile?.avatarAccessory ?? null, 
      avatarBg: u.profile?.avatarBg ?? null, 
      breakdown,
    };
  });
  items.sort((a, b) =>
    b.breakdown.score - a.breakdown.score
  );

  const page = items.slice(0, take);
  const nextCursor = items.length > take ? page[page.length - 1].userId : undefined;

  return { items: page, nextCursor };
}

// 2) 邀請某使用者
export async function inviteUserToStudy(slug: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({ where: { slug }, select: { id: true, status: true, recruitmentStatus: true } });
  if (!study) throw new Error("Study not found");

   if (study.status !== "ongoing") {
    throw new Error("The study is not live. Go live before inviting participants.");
  }
  if (study.recruitmentStatus !== "open") {
    throw new Error("Recruitment is closed. Reopen recruitment before inviting.");
  }

  const exists = await prisma.invitation.findFirst({
    where: { studyId: study.id, userId, status: { in: ["pending", "applied"] } },
    select: { id: true },
  });
  if (exists) return { ok: true, already: true };

  await prisma.invitation.create({
    data: { studyId: study.id, userId, status: "pending", createdAt: new Date() },
  });
  return { ok: true, already: false };
}

// // 3) 參與者清單
// export async function listParticipantsForStudy(slug: string) {
//   const study = await prisma.study.findUnique({ where: { slug }, select: { id: true } });
//   if (!study) throw new Error("Study not found");

//   const [applied, active] = await Promise.all([
//     prisma.participation.findMany({
//       where: { studyId: study.id, status: { in: ["Applied"] } },
//       select: { id: true, status: true, appliedAt: true,  updatedAt: true, user: { select: { id: true, name: true } } },
//       orderBy: { updatedAt: "desc" },
//     }),
//     // prisma.invitation.findMany({
//     //   where: { studyId: study.id, status: "pending" },
//     //   select: { id: true, status: true, createdAt: true, user: { select: { id: true, name: true } } },
//     //   orderBy: { createdAt: "desc" },
//     // }),
//     prisma.participation.findMany({
//       where: { studyId: study.id, status: { in: ["Selected", "Completed"] } },
//       select: { id: true, status: true, updatedAt: true, user: { select: { id: true, name: true } } },
//       orderBy: { updatedAt: "desc" },
//     }),
//   ]);

//   return { applied, active };
// }

// 4) 更新參與狀態
export async function updateParticipationStatus(id: string, next:
  ParticipationStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  await prisma.participation.update({
    where: { id },
    data: { status: next},
  });
  return { ok: true };
}


export async function finalizeParticipantWithThankYou(args: {
  participationId: string;
}) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) throw new Error("Unauthenticated");

  // 取 participation + 權限必要資料
  const p = await prisma.participation.findUnique({
    where: { id: args.participationId },
    select: {
      id: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
          profile: { select: { avatarBase: true, avatarAccessory: true } },
        },
      },
      study: {
        select: {
          id: true,
          name: true,
          collaborators: {
            where: { userId: actorId, role: { in: [CollaboratorRole.owner, CollaboratorRole.editor] } },
            select: { id: true },
          },
          recruitment: {
            select: { image: true, thankYouMessage: true }
          }
        },
      },
    },
  });
  if (!p) throw new Error("Participation not found");

  // 權限：僅研究協作者
  if (p.study.collaborators.length === 0) throw new Error("Not allowed");

  // 研究者資訊（名字、頭像）
  const researcher = await prisma.user.findUnique({
    where: { id: actorId },
    select: {
      name: true,
      profile: { select: { avatarBase: true, avatarAccessory: true } },
    },
  });

  // 同一個交易：upsert 感謝卡 + 將參與者結案
  const result = await prisma.$transaction(async (tx) => {
    const cert = await tx.thankYouCertificate.upsert({
      where: { participationId: p.id },
      update: {
        message: p.study.recruitment?.thankYouMessage ?? null,
        image: p.study.recruitment?.image ?? null,
        // 最新頭像（若對象更新過）
        avatarBaseParticipant: p.user.profile?.avatarBase ?? null,
        avatarAccessoryParticipant: p.user.profile?.avatarAccessory ?? null,
        avatarBaseResearcher: researcher?.profile?.avatarBase ?? null,
        avatarAccessoryResearcher: researcher?.profile?.avatarAccessory ?? null,
      },
      create: {
        participationId: p.id,
        studyName: p.study.name,
        participantName: p.user.name,
        researcherName: researcher?.name ?? "Researcher",
        message: p.study.recruitment?.thankYouMessage ?? null,
        image: p.study.recruitment?.image ?? null,
        avatarBaseParticipant: p.user.profile?.avatarBase ?? null,
        avatarAccessoryParticipant: p.user.profile?.avatarAccessory ?? null,
        avatarBaseResearcher: researcher?.profile?.avatarBase ?? null,
        avatarAccessoryResearcher: researcher?.profile?.avatarAccessory ?? null,
      },
      select: { id: true },
    });

    // 設為 Completed
    await tx.participation.update({
      where: { id: p.id },
      data: { status: ParticipationStatus.Completed },
    });

    return { certificateId: cert.id };
  });

  return { ok: true, ...result };
}



export async function patchForm(slug: string, payload: NormalizedFormPayload) {
  const data = normalizedFormSchema.parse(payload); // 你前端已經在用的 transform

  return await prisma.$transaction(async (tx) => {
    const study = await tx.study.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!study) throw new Error("Study not found");
    if (study.status !== StudyStatus.draft) {
      throw new Error("Form cannot be modified unless the study is in draft.");
    }

    const existing = await tx.form.findUnique({
      where: { studyId: study.id },
      select: { id: true, _count: { select: { responses: true } } },
    });

    // 題目為零 → 視為沒有表單，直接刪除並忽略 description
    if (data.form.length === 0) {
      if (existing) {
        if (existing._count.responses > 0) {
          throw new Error("Form already has responses and cannot be removed.");
        }
        await tx.form.delete({ where: { studyId: study.id } });
      }
      return { ok: true, removed: true };
    }

    // 有題目 → 建或重建
    if (existing) {
      if (existing._count.responses > 0) {
        throw new Error("Form already has responses and cannot be modified.");
      }
      await tx.form.delete({ where: { studyId: study.id } });
    }

    await tx.form.create({
      data: {
        studyId: study.id,
        description: (data.description ?? "").trim() || null,
        questions: {
          create: data.form.map((q, idx) => ({
            text: q.text,
            required: q.required,
            type: q.type,
            evaluationType: q.evaluationType,
             order: idx + 1,           
            options: {
              create: (q.options ?? []).map((o) => ({
                text: o.text,
                score:
                  q.evaluationType === "automatic"
                    ? typeof o.score === "number"
                      ? o.score
                      : 0
                    : null,
              })),
            },
          })),
        },
      },
    });
    revalidatePath(`/my-studies/view/${slug}/application-form`);

    return { ok: true, removed: false };
  });
}




export type ApplyFormDTO = {
  studyId: string;
  slug: string;
  studyName: string;
  status: StudyStatus;
  recruitmentStatus: RecruitmentStatus;
  formId: string;
  description: string | null;
  questions: Array<{
    order: number;
    id: string;
    text: string;
    type: QuestionType;
    required: boolean;
    options?: Array<{ id: string; text: string }>;
  }>;
};


export async function getApplyForm(slug: string): Promise<ApplyFormDTO | null> {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      recruitmentStatus: true,
      form: {
        select: {
          id: true,
          description: true,
          questions: {
            orderBy: { order: "asc" }, // 若你有 question.order，改成 { order: 'asc' }
            select: {
              id: true,
              order: true,
              text: true,
              type: true,
              required: true,
              options: {
                orderBy: { id: "asc" }, // 若你有 option.order，可改成 { order: 'asc' }
                select: { id: true, text: true },
              },
            },
          },
        },
      },
    },
  });

  if (!study || !study.form || study.form.questions.length === 0) return null;

  return {
    studyId: study.id,
    slug: study.slug,
    studyName: study.name,
    status: study.status,
    recruitmentStatus: study.recruitmentStatus,
    formId: study.form.id,
    description: study.form.description,
    questions: study.form.questions.map((q) => ({
      order: q.order,
      id: q.id,
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.type === "text" ? undefined : q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

type ApplyAnswers = Record<string, string | string[]>;

export async function applyToStudy(input: {
  slug: string;
  formId: string;
  answers: ApplyAnswers;
}) {
  const { slug, formId, answers } = input;

  // 1) 取使用者
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // 2) 撈表單 + 研究狀態（需 ongoing/open）
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      study: {
        select: { id: true, slug: true, recruitmentStatus: true, status: true },
      },
      questions: { orderBy: { order: "asc" }, include: { options: true } },
    },
  });

  if (!form || form.study.slug !== slug) {
    redirect(`/recruitment/${slug}?error=Form%20not%20found`);
  }
  if (form.study.status !== "ongoing" || form.study.recruitmentStatus !== "open") {
    redirect(`/recruitment/${slug}?error=Recruitment%20is%20not%20open`);
  }

  // 3) 若已申請：順便把 pending 邀請標記為 applied，然後導回
  const dup = await prisma.participation.findFirst({
    where: { userId, studyId: form.study.id },
    select: { id: true },
  });
  if (dup) {
    const pendingInv = await prisma.invitation.findFirst({
      where: { studyId: form.study.id, userId, status: "pending" },
      select: { id: true },
    });
    if (pendingInv) {
      await prisma.invitation.update({
        where: { id: pendingInv.id },
        data: { status: "applied", respondedAt: new Date() },
      });
    }
    revalidatePath(`/recruitment/${slug}`);
    redirect(`/recruitment/${slug}?applied=1&dup=1`);
  }

  // 4) 建立 Participation / Response / Answers（交易）
  try {
    await prisma.$transaction(async (tx) => {
      const participation = await tx.participation.create({
        data: {
          userId,
          studyId: form.study.id,
          status: "Applied",
          appliedAt: new Date(), 
        },
      });

      const response = await tx.formResponse.create({
        data: {
          participationId: participation.id,
          formId: form.id,
          submittedAt: new Date(),
        },
      });

      let totalScore = 0;

      for (const q of form.questions) {
        const raw = answers[q.id];

        if (q.type === "text") {
          const val = typeof raw === "string" ? raw.trim() : "";
          if (q.required && val === "") throw new Error("Please answer all required questions.");
          await tx.formAnswer.create({
            data: { responseId: response.id, questionId: q.id, text: val },
          });
          continue;
        }

        if (q.type === "single_choice") {
          const selected = typeof raw === "string" ? raw : "";
          if (q.required && !selected) throw new Error("Please answer all required questions.");
          const opt = q.options.find((o) => o.id === selected);
          if (!opt && selected) throw new Error("Invalid selection.");

          const ans = await tx.formAnswer.create({
            data: { responseId: response.id, questionId: q.id },
          });

          if (opt) {
            await tx.formAnswerSelectedOption.create({
              data: { answerId: ans.id, optionId: opt.id },
            });
            if (q.evaluationType === "automatic") totalScore += opt.score ?? 0;
          }
          continue;
        }

        // multiple_choice
        const arr = Array.isArray(raw) ? raw : [];
        if (q.required && arr.length === 0) throw new Error("Please select at least one option.");

        const validOpts = q.options.filter((o) => arr.includes(o.id));

        const ans = await tx.formAnswer.create({
          data: { responseId: response.id, questionId: q.id },
        });

        if (validOpts.length) {
          await tx.formAnswerSelectedOption.createMany({
            data: validOpts.map((o) => ({ answerId: ans.id, optionId: o.id })),
          });
          if (q.evaluationType === "automatic") {
            totalScore += validOpts.reduce((sum, o) => sum + (o.score ?? 0), 0);
          }
        }
      }

      // 寫回 totalScore（你已新增此欄位）
      await tx.formResponse.update({
        where: { id: response.id },
        data: { totalScore },
      });

      // 在同一交易中處理 pending 邀請 → 標記為 applied
      const inv = await tx.invitation.findFirst({
        where: { studyId: form.study.id, userId, status: "pending" },
        select: { id: true },
      });
      if (inv) {
        await tx.invitation.update({
          where: { id: inv.id },
          data: { status: "applied", respondedAt: new Date() },
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Submit failed. Please try again.";
    redirect(`/recruitment/${slug}?error=${encodeURIComponent(msg)}`);
  }

  // 5) 成功：revalidate + 導回
  revalidatePath(`/recruitment/${slug}`);
  redirect(`/recruitment/${slug}?applied=1`);
}



// !!TODO 預查人數
export async function countEligibleProfiles(criteria: Criterion[]) {
  const where = buildRequiredWhere(criteria);
  // 若要排除已在某 study 的人，可以加 notIn 條件
  return prisma.userProfile.count({ where: where.profile.is });
}

