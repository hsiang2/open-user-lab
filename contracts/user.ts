import type { Prisma } from "@prisma/client";

export const PROFILE_FOR_EVAL_SELECT = {
  gender: true,
  language: true,
  region: true,
  background: true,
  birth: true,
} satisfies Prisma.UserProfileSelect;

export type ProfileForEval = Prisma.UserProfileGetPayload<{
  select: typeof PROFILE_FOR_EVAL_SELECT
}>;
