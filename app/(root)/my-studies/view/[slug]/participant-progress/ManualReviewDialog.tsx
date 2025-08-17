// app/(root)/recruitment/[slug]/ManualReviewDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ManualDecision, updateManualDecisions } from "@/lib/actions/participation.actions";
import { useRouter } from "next/navigation";

// export type ManualAnswerItem = {
//   answerId: string;
//   questionId: string;
//   questionText: string;
//   manualDecision: ManualDecision;
//   type: "text" | "single_choice" | "multiple_choice";
//   textAnswer?: string | null;
//   selectedOptions?: Array<{ id: string; text: string; score: number | null }>;
// };
const DECISIONS = ["Pass", "Fail", "Unsure"] as const;
type Decision = (typeof DECISIONS)[number] | null;

export default function ManualReviewDialog({
  slug,
  participationId,
  answers,
  triggerLabel = "Review",
}: {
  slug: string;
  participationId: string;
  answers: Array<{
        answerId: string;
        questionId: string;
        questionText: string;
        manualDecision: ManualDecision;
        type: "text" | "single_choice" | "multiple_choice";
        textAnswer?: string | null;
        selectedOptions?: Array<{ id: string; text: string; score: number | null }>;
      }>;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 本地決策狀態（以 answerId 為 key）
  const [decisions, setDecisions] = useState<Record<string, ManualDecision>>(
    Object.fromEntries(answers.map(a => [a.answerId, a.manualDecision ?? "Unsure"]))
  );

  const setDecision = (answerId: string, value: ManualDecision) =>
    setDecisions(s => ({ ...s, [answerId]: value }));

  const onSave = () => {
    const payload = Object.entries(decisions).map(([answerId, decision]) => ({
      answerId,
      decision: (decision ?? "Unsure") as Exclude<ManualDecision, null> | null,
    }));

    startTransition(async () => {
      await updateManualDecisions({ participationId, slug, decisions: payload });
      // 關閉 + 重新整理以看到新數字
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={answers.length === 0}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manual Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-1 max-h-[60vh] overflow-y-auto my-4">
          {answers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No manual-review questions.</div>
          ) : (
            answers.map((a, i) => (
              <div key={a.answerId} className="flex gap-4 items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {i + 1}. {a.questionText}
                  </p>
                  <div className="ml-3 mt-1 text-sm">
                    {a.type === "text" ? (
                      <div className="font-semibold break-words">{a.textAnswer || <span className="text-muted-foreground">—</span>}</div>
                    ) : (
                      <div className="space-y-1">
                        {a.selectedOptions?.map((o) => (
                          <div key={o.id} className="font-semibold">
                            {o.text}
                          </div>
                        )) || <span className="text-muted-foreground">—</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-40 shrink-0">
                  <Select
                    value={(decisions[a.answerId] ?? "Unsure") as string}
                    onValueChange={(v) => setDecision(a.answerId, v as Decision)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} disabled={isPending || answers.length === 0}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
