'use server';
import { prisma } from '@/db/prisma'
import { LATEST_STUDIES_LIMIT } from "../constants";
import { slugify } from '../utils';

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