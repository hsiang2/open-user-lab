'use server';
import { prisma } from '@/db/prisma'
import { LATEST_STUDIES_LIMIT, STUDY_IMAGE } from "../constants";
import { slugify } from '../utils';
import { auth } from '@/auth';
import { StudyCreatePayload, StudyFullInput } from '@/types';

// Get latest study
export async function getLatestStudies() {
    const data = await prisma.study.findMany({
        take: LATEST_STUDIES_LIMIT,
        orderBy: { createdAt: 'desc' }
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
    // include: {
    //   collaborators: true,
    //   recruitment: true,
    //   participations: true,
    // },
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
            collaborators: true,
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
  return await prisma.thankYouCertificate.findMany({
    where: {
    participation: {
      userId,
    },
    },
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

  // const participantStepsWithOrder = input.participantSteps.map((s, i) => ({
  //   ...s,
  //   order: i + 1,
  // }))
  // const studyStepsWithOrder = input.studySteps.map((s, i) => ({
  //   ...s,
  //   order: i + 1,
  // }))
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

    // // 4) Participant Workflow（Parent and child）
    // if (input.participantSteps?.length) {
    //   await tx.participantWorkflow.create({
    //     data: {
    //       studyId: study.id,
    //       steps: {
    //         create: participantStepsWithOrder.map((s) => ({
    //           name: s.name,
    //           order: s.order,
    //           noteResearcher: s.noteResearcher ?? null,
    //           noteParticipant: s.noteParticipant ?? null,
    //           deadline: s.deadline ?? null,
    //         })),
    //       },
    //     },
    //   })
    // }

    // // 5) Study Workflow（Parent and child）
    // if (input.studySteps?.length) {
    //   await tx.studyWorkflow.create({
    //     data: {
    //       studyId: study.id,
    //       steps: {
    //         create: studyStepsWithOrder.map((s) => ({
    //           name: s.name,
    //           order: s.order,
    //           note: s.note ?? null,
    //           deadline: s.deadline ?? null,
    //         })),
    //       },
    //     },
    //   })
    // }

    return study // { id, slug }
  })
}