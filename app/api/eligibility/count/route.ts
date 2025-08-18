// app/api/eligibility/count/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { insertCriteria } from "@/lib/validators";
import { countEligibleProfiles } from "@/lib/actions/participation.actions";

const Payload = z.object({ criteria: z.array(insertCriteria) });

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = Payload.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const count = await countEligibleProfiles(parsed.data.criteria);
  return NextResponse.json({ count });
}
export const dynamic = "force-dynamic";
