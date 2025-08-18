// contracts/user.ts
import type { Prisma } from "@prisma/client";

// 只有評估會用到的五個欄位
export const PROFILE_FOR_EVAL_SELECT = {
  gender: true,
  language: true,
  region: true,
  background: true,
  birth: true,
} satisfies Prisma.UserProfileSelect;

// 由 select 自動推型別
export type ProfileForEval = Prisma.UserProfileGetPayload<{
  select: typeof PROFILE_FOR_EVAL_SELECT
}>;
