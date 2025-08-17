'use server';
import { prisma } from '@/db/prisma'
import { LATEST_STUDIES_LIMIT, STUDY_IMAGE } from "../constants";
import { slugify } from '../utils';
import { auth } from '@/auth';
import { StudyCreatePayload } from '@/types';
import { revalidatePath } from 'next/cache';
import { fullRecruitmentSchema, recruitmentGoalSchema } from '../validators';
import z, { includes } from 'zod';

// Get latest study
export async function getLatestStudies() {
    const data = await prisma.study.findMany({
      where: {
      status: 'ongoing', 
      recruitmentStatus: 'open'
    },
        take: LATEST_STUDIES_LIMIT,
        orderBy: { createdAt: 'desc' },
        include: {
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
          recruitment: true,
        },
    })
    
    return data
}

export async function getMyStudies(userId: string) {
  return await prisma.study.findMany({
    where: {
      collaborators: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      // collaborators: true,
      recruitment: {
        select: {
        image: true,
        avatarAccessoryResearcher: true,
        avatarBaseResearcher: true
      }
      },
      // participations: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

//Get study by slug 
export async function getStudyForResearcher(slug: string) {
    return await prisma.study.findFirst({
        where: { slug: slug },
        include: {
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
            participations: true,
            participantSaved: true,
            participantWorkflow: { include: { steps: true } },
            studyWorkflow: { include: { steps: true } },
            criteria: true,
            recruitment: true,
            form: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
    })
}

export async function getStudyForExplore(slug: string) {
    return await prisma.study.findFirst({
      where: { slug },
      include: {
        recruitment: true,
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
      },
    });
  }

//Generate slug
export async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name); 
  
    const existing = await prisma.study.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });
  
    const suffixes = existing
      .map((entry) => {
        const match = entry.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
        return match ? parseInt(match[1], 10) : entry.slug === baseSlug ? 0 : null;
      })
      .filter((n): n is number => n !== null);
  
    const next = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 0;
  
    return next === 0 ? baseSlug : `${baseSlug}-${next}`;
  }
  
export async function getThankYouCertificates(userId: string) {
  return prisma.thankYouCertificate.findMany({
    where: { participation: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStudyFull(
  input: StudyCreatePayload
) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error('Unauthenticated');
  
  const profile = await prisma.userProfile.findUnique({
    where: { userId: currentUserId },
    select: { avatarBase: true, avatarAccessory: true },
  })

  const participantStepsWithOrder = (input.participantSteps ?? []).map((s, i) => ({
  name: s.name,
  order: i + 1,
  noteResearcher: s.noteResearcher ?? null,
  noteParticipant: s.noteParticipant ?? null,
  // 統一型別：如果前端傳的是 Date，直接給 Prisma OK；若有可能是字串就轉一下
  deadline: s.deadline ?? null,
}));

const studyStepsWithOrder = (input.studySteps ?? []).map((s, i) => ({
  name: s.name,
  order: i + 1,
  note: s.note ?? null,
  deadline: s.deadline ?? null,
}));

  return await prisma.$transaction(async (tx) => {
    // 1) Study
    const slug = await generateUniqueSlug(input.name)
    const study = await tx.study.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        status: 'draft',
        recruitmentStatus: 'closed',
        // set creator to owner
        collaborators: {
          create: {
            userId: currentUserId,
            role: 'owner',
          },
        },
      },
      select: { id: true, slug: true },
    })

    // 2) Recruitment
    await tx.recruitment.create({
      data: {
        studyId: study.id,
        description: input.description ?? null,
        format: input.format ?? [],
        formatOther: input.formatOther ?? null,
        durationMinutes: input.durationMinutes ?? null,
        sessionDetail: input.sessionDetail ?? null,
        criteriaDescription: input.criteriaDescription ?? null,
        reward: input.reward ?? null,

        image: STUDY_IMAGE[0],
        avatarBaseResearcher: profile?.avatarBase,
        avatarAccessoryResearcher: profile?.avatarAccessory,
        thankYouMessage: "Thank you for participating in our study. Your contribution is greatly appreciated!",
        
        autoCloseSelectedCount: null,
        autoCloseApplicantCount: null,
        autoCloseDate: null,
      },
    })

    // 3) Criteria（multiple）
    if (input.criteria?.length) {
      await tx.criteria.createMany({
        data: input.criteria.map((c) => ({
          studyId: study.id,
          type: c.type,
          value: c.value,
          matchLevel: c.matchLevel,
        })),
      })
    }

    // 4) Participant Workflow（Parent + children）
if (participantStepsWithOrder.length > 0) {
  await tx.participantWorkflow.create({
    data: {
      studyId: study.id,
      steps: {
        create: participantStepsWithOrder,
      },
    },
  });
}

// 5) Study Workflow（Parent + children）
if (studyStepsWithOrder.length > 0) {
  await tx.studyWorkflow.create({
    data: {
      studyId: study.id,
      steps: {
        create: studyStepsWithOrder,
      },
    },
  });
}

    return study // { id, slug }
  })
}


function pathFor(slug: string) {
  return `/my-studies/view/${slug}/overview`;
}

export async function goLive(slug: string) {
  const study = await prisma.study.findUnique({ where: { slug }, select: { status: true } });
  if (!study) throw new Error("Study not found");
  if (study.status !== "draft") throw new Error("Only draft studies can go live");

  await prisma.study.update({
    where: { slug },
    data: { status: "ongoing", recruitmentStatus: "open" },
  });

  revalidatePath(pathFor(slug));
}

export async function endStudy(slug: string) {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: { status: true },
  });
  if (!study) throw new Error("Study not found");
  if (study.status !== "ongoing") throw new Error("Only ongoing studies can be ended");

  await prisma.study.update({
    where: { slug },
    data: { status: "ended", recruitmentStatus: "closed" },
  });

  revalidatePath(pathFor(slug));
}

export async function pauseRecruitment(slug: string) {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: { status: true, recruitmentStatus: true },
  });
  if (!study) throw new Error("Study not found");
  if (study.status !== "ongoing") throw new Error("Study must be ongoing to pause recruitment");
  if (study.recruitmentStatus !== "open") throw new Error("Recruitment is not open");

  await prisma.study.update({
    where: { slug },
    data: { recruitmentStatus: "closed" },
  });

  revalidatePath(pathFor(slug));
}

export async function resumeRecruitment(slug: string) {
  const study = await prisma.study.findUnique({
    where: { slug },
    select: { status: true, recruitmentStatus: true },
  });
  if (!study) throw new Error("Study not found");
  if (study.status !== "ongoing") throw new Error("Study must be ongoing to resume recruitment");
  if (study.recruitmentStatus !== "closed") throw new Error("Recruitment is not closed");

  await prisma.study.update({
    where: { slug },
    data: { recruitmentStatus: "open" },
  });

  revalidatePath(pathFor(slug));
}

//檢查
export async function patchRecruitmentGoal(
  slug: string,
  patchRaw: z.infer<typeof recruitmentGoalSchema>
) {
  const patch = recruitmentGoalSchema.parse(patchRaw);

  const study = await prisma.study.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!study) throw new Error("Study not found");

  let autoCloseDate = patch.autoCloseDate ?? null;
  if (autoCloseDate) {
    autoCloseDate = new Date(autoCloseDate);
    autoCloseDate.setHours(23, 59, 59, 999);
  }

  await prisma.recruitment.upsert({
    where: { studyId: study.id },
    create: {
      studyId: study.id,
      autoCloseSelectedCount: patch.autoCloseSelectedCount ?? null,
      autoCloseApplicantCount: patch.autoCloseApplicantCount ?? null,
      autoCloseDate,
    },
    update: {
      autoCloseSelectedCount: patch.autoCloseSelectedCount ?? null,
      autoCloseApplicantCount: patch.autoCloseApplicantCount ?? null,
      autoCloseDate,
    },
  });

  revalidatePath(`/my-studies/view/${slug}/overview`);
  revalidatePath(`/recruitment/${slug}`);
}

export async function deleteStudy(slug: string) {
  const study = await prisma.study.findUnique({ where: { slug }, select: { id: true } });
  if (!study) throw new Error("Study not found");

  await prisma.study.delete({ where: { slug } });

  revalidatePath("/my-studies");
}


export async function patchRecruitment(
  slug: string,
  patchRaw: z.infer<typeof fullRecruitmentSchema>
) {
  const patch = fullRecruitmentSchema.parse(patchRaw);

  const study = await prisma.study.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!study) throw new Error("Study not found");

  await prisma.recruitment.upsert({
    where: { studyId: study.id },
    create: {
      studyId: study.id,
      reward: patch.reward ?? null,
      format: patch.format ?? [],
      formatOther: patch.formatOther ?? null,
      durationMinutes: patch.durationMinutes ?? null,
      sessionDetail: patch.sessionDetail ?? null,
      criteriaDescription: patch.criteriaDescription ?? null,
      description: patch.description,
      image: patch.image,
      thankYouMessage: patch.thankYouMessage,
    },
    update: {
      reward: patch.reward ?? null,
      format: patch.format ?? [],
      formatOther: patch.formatOther ?? null,
      durationMinutes: patch.durationMinutes ?? null,
      sessionDetail: patch.sessionDetail ?? null,
      criteriaDescription: patch.criteriaDescription ?? null,
      description: patch.description,
      image: patch.image,
      thankYouMessage: patch.thankYouMessage,
    },
  });

  revalidatePath(`/my-studies/view/${slug}/recruitment-settings`);
  revalidatePath(`/recruitment/${slug}`);
}