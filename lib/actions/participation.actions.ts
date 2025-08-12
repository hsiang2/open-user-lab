'use server'


import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CheckResult } from "@/types";

function getProfileValue(profile: any, type: string): unknown {
  switch (type) {
    case "gender": return profile?.gender ?? null;
    case "language": return profile?.language ?? [];
    case "region": return profile?.region ?? null;
    case "background": return profile?.background ?? [];
    case "birth": return profile?.birth ?? null;
    default: return null;
  }
}

function match(type: string, wanted: string[], profileVal: unknown): boolean {
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

    // 陣列格式 [min, max]，轉成數字
    const [minStr, maxStr] = wanted;
    const min = Number(minStr);
    const max = Number(maxStr);

    // 如果 min/max 無法轉成合法數字，就不限制
    if (isNaN(min) || isNaN(max)) return true;

    const now = new Date();
    const age =
        now.getFullYear() -
        birth.getFullYear() -
        (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

    return age >= min && age <= max;
    }

//   if (type === "birth") {
//     const birth = profileVal instanceof Date ? profileVal : null;
//     if (!birth) return false;
//     // 允許 "18-30" 格式（只取第一個值）
//     const token = wanted[0];
//     const m = token?.match(/^(\d{1,3})-(\d{1,3})$/);
//     if (!m) return true; // 未提供合法區間就不作為限制
//     const [_, a, b] = m;
//     const min = Number(a), max = Number(b);
//     const now = new Date();
//     const age = now.getFullYear() - birth.getFullYear() - ((now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) ? 1 : 0);
//     return age >= min && age <= max;
//   }

  // 其他未定義的類型先視為通過
  return true;
}

function isPreferNotToSay(v: unknown) {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().toLowerCase() === "prefer not to say";
  return false;
}


export async function checkStudyEligibility(slug: string): Promise<CheckResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, hasForm: false, missingRequired: [], missingOptional: [], requiredMismatches: [], optionalMismatches: [], reason: "Unauthenticated" };
  }

  const study = await prisma.study.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      recruitmentStatus: true,
      form: { select: { id: true } },
      criteria: { select: { type: true, value: true, matchLevel: true } },
    },
  });
  if (!study) {
    return { ok: false, hasForm: false, missingRequired: [], missingOptional: [], requiredMismatches: [], optionalMismatches: [], reason: "Study not found" };
  }
  const hasForm = !!study.form?.id;

  // 取用戶個資
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { gender: true, language: true, region: true, background: true, birth: true },
  });

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const requiredMismatches: string[] = [];
  const optionalMismatches: string[] = [];

  for (const c of study.criteria) {
    const pv = getProfileValue(profile, c.type);
    const isMissing = isPreferNotToSay(pv);
    const ok = match(c.type, c.value, pv);

    if (isMissing) {
      if (c.matchLevel === "Required") missingRequired.push(c.type);
      else missingOptional.push(c.type);
      continue;
    }

    if (!ok) {
      if (c.matchLevel === "Required") requiredMismatches.push(c.type);
      else optionalMismatches.push(c.type);
    }
  }

  if (missingRequired.length || requiredMismatches.length) {
    return {
      ok: false,
      hasForm,
      missingRequired,
      missingOptional,
      requiredMismatches,
      optionalMismatches,
      reason: "Not eligible",
    };
  }

  // Required 全部 OK；Optional 可能缺/不符但不擋
  return {
    ok: true,
    hasForm,
    missingRequired,
    missingOptional,
    requiredMismatches,
    optionalMismatches,
  };
}

export async function applyDirectly(slug: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  const study = await prisma.study.findUnique({
    where: { slug },
    select: { id: true, recruitmentStatus: true, status: true },
  });
  if (!study) throw new Error("Study not found");
  if (study.status !== "ongoing" || study.recruitmentStatus !== "open") {
    throw new Error("Recruitment is not open");
  }

  // 不重複申請
  const existed = await prisma.participation.findFirst({
    where: { userId, studyId: study.id },
    select: { id: true },
  });
  if (existed) return { ok: true, already: true };

  // 建立 participation
  await prisma.participation.create({
    data: {
      userId,
      studyId: study.id,
      status: "Applied",
      appliedAt: new Date(),
    },
  });

  // 看看是否有 pending 邀請
  const inv = await prisma.invitation.findFirst({
    where: { studyId: study.id, userId, status: "pending" },
    select: { id: true },
  });

if (inv) {
    await prisma.invitation.update({
        where: { id: inv.id },
        data: { status: "applied", respondedAt: new Date() },
        });
}

  return { ok: true, already: false };
}

export async function declineInvitationById(invitationId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthenticated");

  // 只允許本人操作自己的邀請
  const inv = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { userId: true, status: true },
  });
  if (!inv || inv.userId !== userId) throw new Error("Not allowed");
  if (inv.status !== "pending") return { ok: true }; // 已處理過

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "rejected", respondedAt: new Date() },
  });

  return { ok: true };
}

export async function listInvitationsForStudy(slug: string) {
  const study = await prisma.study.findUnique({ where: { slug }, select: { id: true } });
  if (!study) return [];

  return prisma.invitation.findMany({
    where: { studyId: study.id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}