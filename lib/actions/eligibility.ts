import { EvalBreakdown } from "@/contracts/potential-participant";
import { ProfileForEval } from "@/contracts/user";

// lib/eligibility.ts
export type Criterion = {
  type: "gender" | "language" | "region" | "background" | "birth";
  value: string[];
  matchLevel: "Required" | "Optional";
};

export function getProfileValue(profile: any, type: string): unknown {
  switch (type) {
    case "gender": return profile?.gender ?? null;
    case "language": return profile?.language ?? [];
    case "region": return profile?.region ?? null;
    case "background": return profile?.background ?? [];
    case "birth": return profile?.birth ?? null;
    default: return null;
  }
}

export function isPreferNotToSay(v: unknown) {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().toLowerCase() === "prefer not to say";
  return false;
}

export function match(type: string, wanted: string[], profileVal: unknown): boolean {
  if (isPreferNotToSay(profileVal)) return false;

  if (type === "language" || type === "background") {
    const have = Array.isArray(profileVal) ? profileVal : [];
    return have.some((x) => wanted.includes(String(x)));
  }

  if (type === "gender" || type === "region") {
    return wanted.includes(String(profileVal));
  }

  if (type === "birth") {
    const birth = profileVal instanceof Date ? profileVal : null;
    if (!birth) return false;

    const [minStr, maxStr] = wanted;
    const min = Number(minStr);
    const max = Number(maxStr);
    if (isNaN(min) || isNaN(max)) return true;

    const now = new Date();
    const age =
      now.getFullYear() -
      birth.getFullYear() -
      (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

    return age >= min && age <= max;
  }

  return true;
}

// export type MatchBreakdown = {
//   ok: boolean; // Required 是否全通過
//   requiredMatched: string[];
//   optionalMatched: string[];
//   missingRequired: string[];
//   missingOptional: string[];
//   requiredMismatches: string[];
//   optionalMismatches: string[];
//   score: number; // 排序用簡單分數
// };

export function evaluate(
  profile: ProfileForEval | null,
  criteria: Criterion[]
): EvalBreakdown {

  const p: ProfileForEval = profile ?? {
    gender: null,
    language: [],
    region: null,
    background: [],
    birth: null,
  };

  const requiredMatched: string[] = [];
  const optionalMatched: string[] = [];
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const requiredMismatches: string[] = [];
  const optionalMismatches: string[] = [];

  for (const c of criteria) {
    const pv = getProfileValue(p, c.type);
    const missing = isPreferNotToSay(pv);
    const ok = match(c.type, c.value, pv);

    if (missing) {
      if (c.matchLevel === "Required") missingRequired.push(c.type);
      else missingOptional.push(c.type);
      continue;
    }

    if (ok) {
      if (c.matchLevel === "Required") requiredMatched.push(c.type);
      else optionalMatched.push(c.type);
    } else {
      if (c.matchLevel === "Required") requiredMismatches.push(c.type);
      else optionalMismatches.push(c.type);
    }
  }

  const okAllRequired = missingRequired.length === 0 && requiredMismatches.length === 0;
  const score =
    requiredMatched.length * 2 +
    optionalMatched.length * 1 -
    (missingRequired.length + requiredMismatches.length + missingOptional.length + optionalMismatches.length);

  return {
    ok: okAllRequired,
    requiredMatched,
    optionalMatched,
    missingRequired,
    missingOptional,
    requiredMismatches,
    optionalMismatches,
    score,
  };
}
