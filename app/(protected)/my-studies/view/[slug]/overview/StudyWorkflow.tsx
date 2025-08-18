"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import StudyStepHeader from "./StudyStepHeader";
import { setStudyStepStatus } from "@/lib/actions/participation.actions";

export default function StudyWorkflow({
  studyId,
  steps,
  statuses,
}: {
  studyId: string;
  steps: { id: string; order: number; name: string; note: string | null; deadline: string | null }[];
  statuses: { stepId: string; status: "todo" | "completed" }[];
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const toggle = (stepId: string, curr: "todo" | "completed") => {
    const next = curr === "completed" ? "todo" : "completed";
    setBusyKey(stepId);
    start(async () => {
      await setStudyStepStatus({ studyId, stepId, status: next });
      router.refresh();
      setBusyKey(null);
    });
  };

  const statusMap = new Map(statuses.map(s => [s.stepId, s.status]));
  const row = steps.map(s => ({ stepId: s.id, status: (statusMap.get(s.id) ?? "todo") as "todo" | "completed" }));

  return (
    <div className="my-8 w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {steps.map(s => (
              <TableHead key={s.id} className="text-center">
                <StudyStepHeader order={s.order} name={s.name} note={s.note} deadline={s.deadline} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {row.map(st => {
              const checked = st.status === "completed";
              const loading = isPending && busyKey === st.stepId;
              return (
                <TableCell key={st.stepId} className="text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant={checked ? "default" : "outline"} size="sm" disabled={loading}>
                        {loading ? "..." : checked ? <Check size={14} /> : <Check size={14} color="#fff" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {checked ? "Mark this step as incomplete?" : "Mark this step as completed?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {checked ? "This will set this step back to incomplete." : "This will mark this step as completed."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toggle(st.stepId, st.status)}>Confirm</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
