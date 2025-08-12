"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

type ActionType = "goLive" | "endStudy" | "pauseRecruitment" | "resumeRecruitment" | "deleteStudy";

const actionConfig: Record<
  ActionType,
  { title: string; description: string; button: string; variant?: "default" | "secondary" | "destructive" }
> = {
  goLive: {
    title: "Make this study live?",
    description:
      "Publishing will set the study status to ongoing, make it visible to participants, and open recruitment. Application questions will be locked after publishing. You can pause recruitment or end the study at any time.",
    button: "Go live",
    variant: "default",
  },
  endStudy: {
    title: "End this study?",
    description:
      "Ending will set the study status to ended, permanently close recruitment, and remove the study from the participant view. You will no longer be able to edit settings or manage participants. This action cannot be undone.",
    button: "End study",
    variant: "secondary",
  },
  pauseRecruitment: {
    title: "Pause recruitment?",
    description:
      "Pausing will set the recruitment status to closed, hide the study from new participants, and stop new applications. You can still review existing participants and resume recruitment at any time.",
    button: "Pause recruitment",
    variant: "secondary",
  },
  resumeRecruitment: {
    title: "Resume recruitment?",
    description:
      "Resuming will set the recruitment status to open, make the study visible to participants again, and allow new applications. ",
    button: "Resume recruitment",
    variant: "secondary",
  },
  deleteStudy: {
    title: "Delete this study?",
    description:
      "Deleting will permanently remove this study and all associated data from the system. This action cannot be undone.",
    button: "Delete Study",
    variant: "destructive",
  },
};

export function StatusActionDialog({
  type,
  onConfirm,
}: {
  type: ActionType;
  onConfirm: () => Promise<void> | void;
}) {
  const [isPending, startTransition] = useTransition();
  const cfg = actionConfig[type];

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={cfg.variant} className="w-fit">
          {cfg.button}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{cfg.title}</AlertDialogTitle>
          <AlertDialogDescription>{cfg.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => startTransition(onConfirm)}
              disabled={isPending}
            >
              {isPending ? "Working..." : cfg.button}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
