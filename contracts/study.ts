import { AVATAR_ACCESSORY_KEYS, AVATAR_STYLE, RECRUITMENT_FORMATS, STUDY_IMAGE } from "@/lib/constants";
import { toConstOrDefault, toConstOrNull } from "@/lib/utils";
import { RecruitmentFormValues } from "@/types";
import type { Prisma } from "@prisma/client";

export const STUDY_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  recruitmentStatus: true,
  createdAt: true,
  recruitment: {
    select: {
      image: true,
      avatarBaseResearcher: true,
      avatarAccessoryResearcher: true,
    },
  },
} satisfies Prisma.StudySelect;

export type StudyCard = Prisma.StudyGetPayload<{
  select: typeof STUDY_CARD_SELECT
}>;

export const STUDY_FOR_RESEARCHER_INCLUDE = {
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
      },
    },
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
} satisfies Prisma.StudyInclude;

export type StudyForResearcher = Prisma.StudyGetPayload<{
  include: typeof STUDY_FOR_RESEARCHER_INCLUDE
}>;

export function toRecruitmentFormValues(
  rec: StudyForResearcher["recruitment"] 
): RecruitmentFormValues {
  const allowed = new Set(RECRUITMENT_FORMATS as readonly string[]);
  const format = Array.isArray(rec?.format)
    ? (rec!.format.filter(f => allowed.has(f)) as typeof RECRUITMENT_FORMATS[number][])
    : ([] as typeof RECRUITMENT_FORMATS[number][]);

    const duration =
  typeof rec?.durationMinutes === "number" && rec.durationMinutes > 0
    ? Math.min(rec.durationMinutes, 24 * 60)
    : 60;

  return {
    // fullRecruitmentSchema 
    description: rec?.description ?? "",
    image: toConstOrDefault(STUDY_IMAGE, rec?.image ?? null,  STUDY_IMAGE[0]),
    thankYouMessage: rec?.thankYouMessage ?? "",

    // insertRecruitmentSchema 
    reward: rec?.reward ?? null,
    format,
    formatOther: rec?.formatOther ?? null,
    durationMinutes: duration,
    sessionDetail: rec?.sessionDetail ?? null,
    criteriaDescription: rec?.criteriaDescription ?? "",

    // nullable enum
    avatarBaseResearcher: toConstOrNull( AVATAR_STYLE, rec?.avatarBaseResearcher ?? null),
    avatarAccessoryResearcher: toConstOrNull( AVATAR_ACCESSORY_KEYS, rec?.avatarAccessoryResearcher ?? null),
  };
}