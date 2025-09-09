import type { Prisma } from "@prisma/client";
import { PROFILE_FOR_EVAL_SELECT } from "@/contracts/user";

export type EvalBreakdown = {
  ok: boolean;
  requiredMatched: string[];
  optionalMatched: string[];
  missingRequired: string[];
  missingOptional: string[];
  requiredMismatches: string[];
  optionalMismatches: string[];
  score: number;
};

export type PotentialParticipantItem = {
  userId: string;
  name: string | null;
  avatarBase: string | null;
  avatarAccessory: string | null;
  avatarBg: string | null;
  breakdown: EvalBreakdown;
};

export const USER_FOR_POTENTIAL_SELECT = {
  id: true,
  name: true,
  profile: {
    select: {
      ...PROFILE_FOR_EVAL_SELECT, // gender, language, region, background, birth
      avatarBase: true,
      avatarAccessory: true,
      avatarBg: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserForPotentialRaw = Prisma.UserGetPayload<{
  select: typeof USER_FOR_POTENTIAL_SELECT;
}>;
