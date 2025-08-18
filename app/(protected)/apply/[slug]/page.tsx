import { auth } from "@/auth";
import { notFound } from "next/navigation";

import { getApplyForm } from "@/lib/actions/participation.actions";
import ApplyFormClient from "./ApplyFormClient";

export default async function ApplyPage( { params }: { params: { slug: string } }  ) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const {slug} = await params

  const data = await getApplyForm(slug);
  if (!data) notFound();

  return <ApplyFormClient data={data} />;
}
