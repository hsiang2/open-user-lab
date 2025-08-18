// contracts/potential-participant.ts
import type { Prisma } from "@prisma/client";
import { PROFILE_FOR_EVAL_SELECT } from "@/contracts/user"; // 之前回你建立過的

// evaluate 回傳最少有 score；其餘細節你要可以再加
export type EvalBreakdown = {
  ok: boolean;
  requiredMatched: string[];
  optionalMatched: string[];
  missingRequired: string[];
  missingOptional: string[];
  requiredMismatches: string[];
  optionalMismatches: string[];
    score: number;
//   [k: string]: unknown;
};

// type Breakdown = {
//   ok: boolean;
//   requiredMatched: string[];
//   optionalMatched: string[];
//   missingRequired: string[];
//   missingOptional: string[];
//   requiredMismatches: string[];
//   optionalMismatches: string[];
//   score: number;
// };

// 卡片要顯示的參與者資料
export type PotentialParticipantItem = {
  userId: string;
  name: string | null;
  avatarBase: string | null;
  avatarAccessory: string | null;
  avatarBg: string | null;
  breakdown: EvalBreakdown;
};

// 這支查詢會用到的 user select（含 profile 需要的欄位 + avatar）
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
