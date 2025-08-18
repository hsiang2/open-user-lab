// contracts/studyCard.ts
import { AVATAR_ACCESSORY_KEYS, AVATAR_STYLE, RECRUITMENT_FORMATS, STUDY_IMAGE } from "@/lib/constants";
import { toConstOrDefault, toConstOrNull } from "@/lib/utils";
import { RecruitmentFormValues } from "@/types";
import type { Prisma } from "@prisma/client";

// 1) 定義一份可重用的 select
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

// 2) 用這份 select 推導出回傳型別
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
  participations: true,      // 如果太大，改成 select 只拿你要的欄位
  participantSaved: true,    // 同上
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

// 由 include 自動推導回傳型別
export type StudyForResearcher = Prisma.StudyGetPayload<{
  include: typeof STUDY_FOR_RESEARCHER_INCLUDE
}>;


export function toRecruitmentFormValues(
  rec: StudyForResearcher["recruitment"] 
): RecruitmentFormValues {
  // format：DB 是 string[]，表單是 enum[]，先過濾不合法值
  const allowed = new Set(RECRUITMENT_FORMATS as readonly string[]);
  const format = Array.isArray(rec?.format)
    ? (rec!.format.filter(f => allowed.has(f)) as typeof RECRUITMENT_FORMATS[number][])
    : ([] as typeof RECRUITMENT_FORMATS[number][]);

    const duration =
  typeof rec?.durationMinutes === "number" && rec.durationMinutes > 0
    ? Math.min(rec.durationMinutes, 24 * 60)
    : 60;

  return {
    // fullRecruitmentSchema 要求的欄位
    description: rec?.description ?? "",
    image: toConstOrDefault(STUDY_IMAGE, rec?.image ?? null,  STUDY_IMAGE[0]),
    thankYouMessage: rec?.thankYouMessage ?? "",

    // 來自 insertRecruitmentSchema 的欄位
    reward: rec?.reward ?? null,
    format,
    formatOther: rec?.formatOther ?? null,
    durationMinutes: duration,
    sessionDetail: rec?.sessionDetail ?? null,
    // 這個在 schema 是必填 min(1)，初始給空字串，交表前會驗證
    criteriaDescription: rec?.criteriaDescription ?? "",

    // 可為 null 的 enum
    avatarBaseResearcher: toConstOrNull( AVATAR_STYLE, rec?.avatarBaseResearcher ?? null),
    avatarAccessoryResearcher: toConstOrNull( AVATAR_ACCESSORY_KEYS, rec?.avatarAccessoryResearcher ?? null),

    // 如果之後你把 autoClose 三個欄位加回表單，也可在這裡補上
    // autoCloseSelectedCount: rec?.autoCloseSelectedCount ?? null,
    // autoCloseApplicantCount: rec?.autoCloseApplicantCount ?? null,
    // autoCloseDate: rec?.autoCloseDate ? rec.autoCloseDate.toISOString() : null,
  };
}