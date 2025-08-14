// !!!!TODO lib/eligible-count.ts (server-only module)
import { prisma } from "@/db/prisma";

export type Criterion = {
  type: "gender" | "language" | "region" | "background" | "birth";
  value: string[]; // birth: [minAge, maxAge]
  matchLevel: "Required" | "Optional" | "No Preference";
};

export function buildRequiredWhereForProfile(criteria: Criterion[]) {
  const ands: any[] = [];
  for (const c of criteria) {
    if (c.matchLevel !== "Required") continue;
    switch (c.type) {
      case "gender":     ands.push({ gender:   { in: c.value } }); break;
      case "region":     ands.push({ region:   { in: c.value } }); break;
      case "language":   ands.push({ language: { hasSome: c.value } }); break;
      case "background": ands.push({ background:{ hasSome: c.value } }); break;
      case "birth": {
        const [minStr, maxStr] = c.value;
        const min = Number(minStr), max = Number(maxStr);
        if (Number.isFinite(min) && Number.isFinite(max)) {
          const now = new Date();
          const oldest   = new Date(now); oldest.setFullYear(now.getFullYear() - max - 1); oldest.setMonth(11, 31);
          const youngest = new Date(now); youngest.setFullYear(now.getFullYear() - min);
          ands.push({ birth: { gte: oldest, lte: youngest } });
        } else {
          ands.push({ birth: { not: null } });
        }
        break;
      }
    }
  }
  return ands.length ? { AND: ands } : {};
}

export async function countEligibleProfilesCore(
  criteria: Criterion[],
  opts?: { excludeUserIds?: string[] }
) {
  const where = buildRequiredWhereForProfile(criteria);
  const count = await prisma.userProfile.count({
    where: {
      ...where,
      ...(opts?.excludeUserIds?.length ? { userId: { notIn: opts.excludeUserIds } } : {}),
    },
  });
  return { count };
}
