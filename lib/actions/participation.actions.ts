'use server'

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CheckResult } from "@/types";
import { Criterion, evaluate, getProfileValue, isPreferNotToSay, match } from "./eligibility";
import { CollaboratorRole, ParticipationStatus, StepStatus } from "@prisma/client";

// function getProfileValue(profile: any, type: string): unknown {
//   switch (type) {
//     case "gender": return profile?.gender ?? null;
//     case "language": return profile?.language ?? [];
//     case "region": return profile?.region ?? null;
//     case "background": return profile?.background ?? [];
//     case "birth": return profile?.birth ?? null;
//     default: return null;
//   }
// }

// function match(type: string, wanted: string[], profileVal: unknown): boolean {
//   if (isPreferNotToSay(profileVal)) return false;

//   if (type === "language" || type === "background") {
//     const have = Array.isArray(profileVal) ? profileVal : [];
//     return have.some((x) => wanted.includes(String(x)));
//   }

//   if (type === "gender" || type === "region") {
//     return wanted.includes(String(profileVal));
//   }

//   if (type === "birth") {
//     const birth = profileVal instanceof Date ? profileVal : null;
//     if (!birth) return false;

//     // 陣列格式 [min, max]，轉成數字
//     const [minStr, maxStr] = wanted;
//     const min = Number(minStr);
//     const max = Number(maxStr);

//     // 如果 min/max 無法轉成合法數字，就不限制
//     if (isNaN(min) || isNaN(max)) return true;

//     const now = new Date();
//     const age =
//         now.getFullYear() -
//         birth.getFullYear() -
//         (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

//     return age >= min && age <= max;
//     }

//   // 其他未定義的類型先視為通過
//   return true;
// }

// function isPreferNotToSay(v: unknown) {
//   if (v == null) return true;
//   if (Array.isArray(v)) return v.length === 0;
//   if (typeof v === "string") return v.trim().toLowerCase() === "prefer not to say";
//   return false;
// }
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
    select: { gender: true, language: true, region: true, background: true, birth: true },
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


// export async function checkStudyEligibility(slug: string): Promise<CheckResult> {
//   const session = await auth();
//   const userId = session?.user?.id;
//   if (!userId) {
//     return { ok: false, hasForm: false, missingRequired: [], missingOptional: [], requiredMismatches: [], optionalMismatches: [], reason: "Unauthenticated" };
//   }

//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: {
//       id: true,
//       status: true,
//       recruitmentStatus: true,
//       form: { select: { id: true } },
//       criteria: { select: { type: true, value: true, matchLevel: true } },
//     },
//   });
//   if (!study) {
//     return { ok: false, hasForm: false, missingRequired: [], missingOptional: [], requiredMismatches: [], optionalMismatches: [], reason: "Study not found" };
//   }
//   const hasForm = !!study.form?.id;

//   // 取用戶個資
//   const profile = await prisma.userProfile.findUnique({
//     where: { userId },
//     select: { gender: true, language: true, region: true, background: true, birth: true },
//   });

//   const missingRequired: string[] = [];
//   const missingOptional: string[] = [];
//   const requiredMismatches: string[] = [];
//   const optionalMismatches: string[] = [];

//   for (const c of study.criteria) {
//     const pv = getProfileValue(profile, c.type);
//     const isMissing = isPreferNotToSay(pv);
//     const ok = match(c.type, c.value, pv);

//     if (isMissing) {
//       if (c.matchLevel === "Required") missingRequired.push(c.type);
//       else missingOptional.push(c.type);
//       continue;
//     }

//     if (!ok) {
//       if (c.matchLevel === "Required") requiredMismatches.push(c.type);
//       else optionalMismatches.push(c.type);
//     }
//   }

//   if (missingRequired.length || requiredMismatches.length) {
//     return {
//       ok: false,
//       hasForm,
//       missingRequired,
//       missingOptional,
//       requiredMismatches,
//       optionalMismatches,
//       reason: "Not eligible",
//     };
//   }

//   // Required 全部 OK；Optional 可能缺/不符但不擋
//   return {
//     ok: true,
//     hasForm,
//     missingRequired,
//     missingOptional,
//     requiredMismatches,
//     optionalMismatches,
//   };
// }


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

// export async function listInvitedParticipantsPaginated({
//   slug,
//   cursor,
//   take = 20,
// }: { slug: string; cursor?: string; take?: number }) {
//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: { id: true },
//   });
//   if (!study) throw new Error("Study not found");

//   const rows = await prisma.invitation.findMany({
//     where: { studyId: study.id },
//     select: {
//       id: true,
//       status: true,
//       createdAt: true,
//       respondedAt: true,
//       user: { select: { id: true, name: true } },
//     },
//     orderBy: { createdAt: "desc" },
//     take: take + 1,
//     ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
//   });

//   const items = rows.slice(0, take);
//   const nextCursor = rows.length > take ? items[items.length - 1].id : undefined;

//   return { items, nextCursor };
// }


// export async function listSelectedParticipants( slug: string ) {
//   const study = await prisma.study.findUnique({
//     where: { slug },
//     select: { id: true },
//   });
//   if (!study) throw new Error("Study not found");

//   return prisma.participation.findMany({
//     where: {
//       studyId: study.id,
//       status: { in: ["Selected", "Completed"] },
//     },
//     select: {
//       id: true,
//       status: true,
//       updatedAt: true,
//       user: { select: { id: true, name: true } },
//       workflowStepStatuses: {
//         select: {
//           id: true,
//           stepId: true,
//           status: true,
//           completedAt: true,
//           step: { select: { id: true, name: true, order: true } },
//         },
//         orderBy: { step: { order: "asc" } },
//       },
//       thankYouCertificate: { select: { id: true } },
//     },
//     orderBy: { updatedAt: "desc" },
//     // take: take + 1,
//     // ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
//   });

//   // const items = rows.slice(0, take);
//   // const nextCursor = rows.length > take ? items[items.length - 1].id : undefined;

//   // return { items, nextCursor };
// }

export async function listAppliedParticipants(slug: string) {
  const study = await prisma.study.findUnique({
    where: { slug },
    include: {
      criteria: true,
      participations: {
        where: { status: "Applied" },
        include: {
          user: { include: { profile: true } },
          formResponses: {
            select: {
              id: true,
              submittedAt: true,
              answers: {
                select: {
                  id: true,
                  text: true,
                  question: {
                    select: {
                      id: true,
                      text: true,
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

  return study.participations.map((p) => {
    const breakdown = evaluate(p.user.profile, study.criteria as Criterion[]);

    const form = p.formResponses[0];

    const manualQuestions = [];
    const scoredQuestions = [];
    const unscoredQuestions = [];
    let scoredQuestionsScore = 0;

    if (form) {
      for (const ans of form.answers) {
        const q = ans.question;

        if (q.evaluationType === "manual") {
          manualQuestions.push(ans);
        } else if (
          q.options?.some((opt) => opt.score !== null && opt.score !== undefined)
        ) {
          scoredQuestions.push(ans);

          // 計分題加總
          const totalForThisAnswer = ans.selectedOptions.reduce((sum, sel) => {
            return sum + (sel.option.score ?? 0);
          }, 0);

          scoredQuestionsScore += totalForThisAnswer;
        } else {
          unscoredQuestions.push(ans);
        }
      }
    }

    return {
      id: p.id,
      status: p.status,
      appliedAt: p.appliedAt,
      updatedAt: p.updatedAt,
      user: p.user,
      criteriaMatch: breakdown,
      manualQuestions,
      scoredQuestions,
      scoredQuestionsScore,
      unscoredQuestions,
    };
  });
}



export type WorkflowStepDTO = {
  id: string;
  name: string;
  order: number;
  noteResearcher: string | null;
  noteParticipant: string | null;
  deadline: string | null; // ISO
};

export type RowDTO = {
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

export async function listSelectedWithWorkflow(slug: string): Promise<{
  steps: WorkflowStepDTO[];
  rows: RowDTO[];
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      participantWorkflow: {
        select: {
          steps: {
            select: {
              id: true,
              name: true,
              order: true,
              noteResearcher: true,
              noteParticipant: true,
              deadline: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  if (!study) throw new Error("Study not found");

  const steps: WorkflowStepDTO[] =
    (study.participantWorkflow?.steps ?? []).map(s => ({
      id: s.id,
      name: s.name,
      order: s.order,
      noteResearcher: s.noteResearcher ?? null,
      noteParticipant: s.noteParticipant ?? null,
      deadline: s.deadline ? s.deadline.toISOString() : null,
    }));

  const parts = await prisma.participation.findMany({
    where: { studyId: study.id, status: { in: ["Selected", "Completed"] } },
    select: {
      id: true,
      status: true,
      user: { select: { id: true, name: true } },
      workflowStepStatuses: {
        select: { id: true, status: true, completedAt: true, stepId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows: RowDTO[] = parts.map(p => {
    const map = new Map(p.workflowStepStatuses.map(s => [s.stepId, s]));
    const statuses = steps.map(st => {
      const hit = map.get(st.id);
      return hit
        ? {
            stepId: st.id,
            statusId: hit.id,
            status: hit.status,
            completedAt: hit.completedAt?.toISOString() ?? null,
          }
        : { stepId: st.id, status: "todo" as StepStatus };
    });
    return { participationId: p.id, participationStatus: p.status, user: p.user, statuses };
  });

  return { steps, rows };
}


export async function setParticipantStepStatus(params: {
  participationId: string;
  stepId: string;
  status: StepStatus;                // 'todo' | 'completed'
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
  const ands: any[] = [];

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

// function buildRequiredWhere(criteria: Criterion[]) {
//   const ands: any[] = [];
//   for (const c of criteria) {
//     if (c.matchLevel !== "Required") continue;
//     if (c.type === "gender") ands.push({ gender: { in: c.value } });
//     else if (c.type === "region") ands.push({ region: { in: c.value } });
//     else if (c.type === "language") ands.push({ language: { hasSome: c.value } });
//     else if (c.type === "background") ands.push({ background: { hasSome: c.value } });
//     else if (c.type === "birth") {
//       const [minStr, maxStr] = c.value;
//       const min = Number(minStr);
//       const max = Number(maxStr);
//       if (!isNaN(min) && !isNaN(max)) {
//         const now = new Date();
//         const start = new Date(now);
//         start.setFullYear(now.getFullYear() - max - 1);
//         start.setMonth(11, 31);
//         const end = new Date(now);
//         end.setFullYear(now.getFullYear() - min);
//         ands.push({ birth: { gte: start, lte: end } });
//       }
//     }
//   }
//   return ands.length ? { profile: { AND: ands } } : { profile: { isNot: null } };
// }

// 1) 候選清單
export async function listPotentialParticipantsForStudy(params: {
  slug: string;
  take?: number;
  cursor?: string;
  // onlyEligible?: boolean;
  // sortBy?: "best" | "newest";
}) {
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
    select: {
      id: true,
      name: true,
      // createdAt: true,
      profile: {
        select: { 
          gender: true, 
          language: true, 
          region: true, 
          background: true, 
          birth: true, 

          avatarBase : true, 
          avatarAccessory: true, 
          avatarBg: true, 
        },
      },
    },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const items = users.map(u => {
    const breakdown = evaluate(u.profile, study.criteria as Criterion[]);
    return {
      userId: u.id,
      name: u.name,
      avatarBase : u.profile?.avatarBase, 
      avatarAccessory: u.profile?.avatarAccessory, 
      avatarBg: u.profile?.avatarBg, 
      // createdAt: u.createdAt,
      breakdown,
    };
  });

  // let list = items;
  // if (onlyEligible) list = items.filter(x => x.breakdown.ok);

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



// !!TODO 預查人數
export async function countEligibleProfiles(criteria: Criterion[]) {
  const where = buildRequiredWhere(criteria);
  // 若要排除已在某 study 的人，可以加 notIn 條件
  return prisma.userProfile.count({ where: where.profile.is });
}

