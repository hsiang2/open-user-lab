"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StepHeader from "./StepHeader";
import { finalizeParticipantWithThankYou, RowDTO, setParticipantStepStatus } from "@/lib/actions/participation.actions";
import { Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SelectedTableClient({ steps, rows }: { steps: any[]; rows: any[] }) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const toggle = (pId: string, stepId: string, curr: "todo" | "completed") => {
    const next = curr === "completed" ? "todo" : "completed";
    const key = `${pId}:${stepId}`;
    setBusyKey(key);
    start(async () => {
      await setParticipantStepStatus({ participationId: pId, stepId, status: next });
      router.refresh();
      setBusyKey(null);
    });
  };



  return (
    <div className="my-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Participant</TableHead>
            {steps.map(s => (
              <TableHead key={s.id} className="text-center">
                <StepHeader
                    order={s.order}
                  name={s.name}
                  noteResearcher={s.noteResearcher}
                  noteParticipant={s.noteParticipant}
                  deadline={s.deadline}
                />
              </TableHead>
            ))}
            <TableHead className="text-center">Thank you</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r:RowDTO) => {
            const rowLocked = r.participationStatus === "Completed";
            return(
              <TableRow key={r.participationId} className={rowLocked ? "opacity-60" : ""}>
              <TableCell className="font-medium">
                {r.user.name}
              </TableCell>
              {r.statuses.map(st => {
                const key = `${r.participationId}:${st.stepId}`;
                const checked = st.status === "completed";
                const loading = isPending && busyKey === key;
                return (
                  <TableCell key={st.stepId} className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                      variant={checked ? "default" : "outline"}
                      size="sm"
                       disabled={loading || rowLocked}
                    >
                        {loading ? "..." : (checked ? <Check size={14}/> : <Check size={14} color="#fff"/>)}
                    </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {checked ? "Mark this step as incomplete?" : "Mark this step as completed?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {checked
                              ? "This will set this step back to incomplete."
                              : "This will mark this step as completed."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggle(r.participationId, st.stepId, st.status)}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                  </TableCell>
                );
              })}
              <TableCell className="text-center">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                        size="sm"
                        variant="secondary"
                       disabled={rowLocked || (isPending && busyKey === `thankyou:${r.participationId}`)}
                        >
                        {isPending && busyKey === `thankyou:${r.participationId}` ? "..." : "Send"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Send Thank You & complete?</AlertDialogTitle>
                        <AlertDialogDescription>
                             This will send a thank‑you certificate and mark this participant as <b>Completed</b>.
                              After this, the row will be locked and cannot be edited.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction                 
                          onClick={() => {
                            const key = `thankyou:${r.participationId}`;
                            setBusyKey(key);
                            start(async () => {
                              await finalizeParticipantWithThankYou({ participationId: r.participationId });
                              router.refresh();
                              setBusyKey(null);
                            });
                          }}
                        >
                            Confirm
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
              </TableCell>
            </TableRow>
            )
            
          })}
        </TableBody>
      </Table>
    </div>
  );
}
