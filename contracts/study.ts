// contracts/studyCard.ts
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
