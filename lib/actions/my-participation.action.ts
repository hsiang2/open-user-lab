"use server";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import type { StepStatus } from "@prisma/client";
import { STUDY_CARD_SELECT } from "@/contracts/study";


async function requireUserId() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthenticated");
  return s.user.id;
}


/** 1) Participating = 我被選上（Selected），研究未結束 */
export async function listMyParticipatingStudies() {
  const userId = await requireUserId();

  const rows = await prisma.participation.findMany({
    where: { userId, status: "Selected", study: { status: { not: "ended" } } },
    orderBy: { updatedAt: "desc" },
    include: {
      study: {
         select: STUDY_CARD_SELECT,
      },
    },
  });

  return rows.map(r => r.study);
}

/** 2) Pending = 我已申請（Applied） */
export async function listMyPendingStudies() {
  const userId = await requireUserId();

  const rows = await prisma.participation.findMany({
    where: { userId, status: "Applied" },
    orderBy: { appliedAt: "desc" },
    include: {
      study: {
         select: STUDY_CARD_SELECT,
      },
    },
  });

  return rows.map(r => r.study);
}

/** 3) Invitations = 我收到的邀請（pending）→ 只回傳 study 陣列 */
export async function listMyInvitationStudies() {
  const userId = await requireUserId();

  const rows = await prisma.invitation.findMany({
    where: { userId, status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      study: {
         select: STUDY_CARD_SELECT,
      },
    },
  });

  return rows.map(r => r.study);
}

/** 4) Ended = 我已完成 或 研究已結束 */
export async function listMyEndedStudies() {
  const userId = await requireUserId();

  const rows = await prisma.participation.findMany({
    where: {
      userId,
      OR: [{ status: "Completed" }, { study: { status: "ended" } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      study: {
         select: STUDY_CARD_SELECT,
      },
    },
  });

  return rows.map(r => r.study);
}


// detail
export async function getMyParticipationDetailBySlug(slug: string) {
  const userId = await requireUserId();

  const p = await prisma.participation.findFirst({
    where: { userId, study: { slug } },
    select: {
      id: true,
      status: true,            // "Selected" / "Applied" / ...
      study: {
        select: {
          id: true, slug: true, name: true, description: true,
          status: true, recruitmentStatus: true,
          collaborators: {
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    profile: {
                      select: {
                        avatarBase: true,
                        avatarAccessory: true,
                        avatarBg: true,
                      },
                    },
                  },
                }
              }
            },
          recruitment: {
            select: {
              description: true,
              format: true,
              durationMinutes: true,
              sessionDetail: true,
              criteriaDescription: true,
              reward: true,
              image: true,
              avatarBaseResearcher: true,
              avatarAccessoryResearcher: true,
            },
          },
          participantWorkflow: {
            select: {
              steps: {
                select: {
                  id: true,
                  name: true,
                  order: true,
                  noteParticipant: true,
                  deadline: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      workflowStepStatuses: {
        select: { id: true, stepId: true, status: true, completedAt: true },
      },
    },
  });

  if (!p) throw new Error("Not found");

  // Progress 分頁：只有 Selected 時才真的有流程；其他狀態回傳空 steps 也行
  const steps = (p.study.participantWorkflow?.steps ?? []).map(st => ({
    id: st.id,
    name: st.name,
    order: st.order,
    noteParticipant: st.noteParticipant ?? null,
    deadline: st.deadline ? st.deadline.toISOString() : null,
  }));

  const map = new Map(p.workflowStepStatuses.map(s => [s.stepId, s]));
  const statuses = steps.map(st => {
    const hit = map.get(st.id);
    return hit
      ? {
          stepId: st.id,
          statusId: hit.id,
          status: hit.status as StepStatus,
          completedAt: hit.completedAt?.toISOString() ?? null,
        }
      : { stepId: st.id, status: "todo" as StepStatus };
  });

  return {
    participationId: p.id,
    participationStatus: p.status,
    study: {
      id: p.study.id,
      slug: p.study.slug,
      name: p.study.name,
      description: p.study.description,
      status: p.study.status,
      recruitmentStatus: p.study.recruitmentStatus,
      recruitment: p.study.recruitment,
    collaborators: p.study.collaborators
    },
    progress: {
      steps,
      statuses,
    },
  };
}
