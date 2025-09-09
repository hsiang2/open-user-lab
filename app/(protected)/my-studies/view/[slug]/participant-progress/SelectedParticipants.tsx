import { listSelectedParticipantProgress } from "@/lib/actions/participation.actions";
import SelectedTableClient from "./SelectedTableClient";

export default async function SelectedParticipants({ slug }: { slug: string }) {
  const { steps, progress } = await listSelectedParticipantProgress(slug);
  return <SelectedTableClient steps={steps} rows={progress} />;
}
