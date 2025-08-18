import { auth } from "@/auth";
import { notFound } from "next/navigation";

import { getApplyForm } from "@/lib/actions/participation.actions";
import ApplyFormClient from "./ApplyFormClient";
import { PageParams } from "@/types/next-helper";

export default async function ApplyPage( { params }: PageParams<{ slug: string }> ) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const {slug} = await params

  const data = await getApplyForm(slug);
  if (!data) notFound();

  return <ApplyFormClient data={data} />;
}
