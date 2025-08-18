"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import { applyDirectly, checkStudyEligibility } from "@/lib/actions/participation.actions";

type WarnState =
  | null
  | { kind: "BLOCK_MISSING_REQUIRED"; fields: string[] }
  | { kind: "BLOCK_REQUIRED_MISMATCH"; fields: string[] }
  | { kind: "WARN_MISSING_OPTIONAL"; fields: string[] }
  | { kind: "WARN_OPTIONAL_MISMATCH"; fields: string[] }
  | { kind: "WARN_BOTH_OPTIONAL"; missing: string[]; mismatch: string[] };

export function ApplyButton({ slug, disabled }: { slug: string; disabled: boolean }) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const [warn, setWarn] = useState<WarnState>(null);
  const [openWarn, setOpenWarn] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [lastHasForm, setLastHasForm] = useState<boolean | null>(null);

  async function handleApply() {
    start(async () => {
      const res = await checkStudyEligibility(slug);
      setLastHasForm(res.hasForm);

      // 1) 阻擋（required）
      if (res.missingRequired.length > 0) {
        setWarn({ kind: "BLOCK_MISSING_REQUIRED", fields: res.missingRequired });
        setOpenWarn(true);
        return;
      }
      if (res.requiredMismatches.length > 0) {
        setWarn({ kind: "BLOCK_REQUIRED_MISMATCH", fields: res.requiredMismatches });
        setOpenWarn(true);
        return;
      }

      // 2) 提醒（optional）
      const missOpt = res.missingOptional;
      const misOpt = res.optionalMismatches;
      if (missOpt.length > 0 && misOpt.length > 0) {
        setWarn({ kind: "WARN_BOTH_OPTIONAL", missing: missOpt, mismatch: misOpt });
        setOpenWarn(true);
        return;
      }
      if (missOpt.length > 0) {
        setWarn({ kind: "WARN_MISSING_OPTIONAL", fields: missOpt });
        setOpenWarn(true);
        return;
      }
      if (misOpt.length > 0) {
        setWarn({ kind: "WARN_OPTIONAL_MISMATCH", fields: misOpt });
        setOpenWarn(true);
        return;
      }

      // 3) 完全通過
      if (res.hasForm) {
        router.push(`/apply/${slug}`);
      } else {
        setOpenConfirm(true);
      }
    });
  }

  function proceedAfterWarn() {
    setOpenWarn(false);
    if (lastHasForm === true) {
      router.push(`/apply/${slug}`);
    } else if (lastHasForm === false) {
      setOpenConfirm(true);
    } else {
      // 保險：不太會進來
      start(async () => {
        const res = await checkStudyEligibility(slug);
        setLastHasForm(res.hasForm);
        if (res.hasForm) router.push(`/apply/${slug}`);
        else setOpenConfirm(true);
      });
    }
  }

  async function confirmApply() {
    setOpenConfirm(false);
    start(async () => {
      const r = await applyDirectly(slug);
      if (r.ok) router.refresh();
    });
  }

  // ===== Render helpers =====
  function titleAndBodyFromWarn(w: NonNullable<WarnState>) {
    switch (w.kind) {
      case "BLOCK_MISSING_REQUIRED":
        return {
          title: "You’re missing required information",
          body: `Please complete: ${w.fields.join(", ")}`,
          cta: "update", // show update profile
        };
      case "BLOCK_REQUIRED_MISMATCH":
        return {
          title: "You’re not eligible",
          body: `Not eligible based on: ${w.fields.join(", ")}`,
          cta: "close", // only close; updating無效
        };
      case "WARN_MISSING_OPTIONAL":
        return {
          title: "Before you apply",
          body: `You haven't provided: ${w.fields.join(
            ", "
          )}\nAdding this info may improve your chances.`,
          cta: "update-or-continue",
        };
      case "WARN_OPTIONAL_MISMATCH":
        return {
          title: "Before you apply",
          body: `You may not match: ${w.fields.join(
            ", "
          )}\nYou can still apply.`,
          cta: "continue-only",
        };
      case "WARN_BOTH_OPTIONAL":
        return {
          title: "Before you apply",
          body:
            `You haven't provided: ${w.missing.join(", ")}\n` +
            `You may not match: ${w.mismatch.join(", ")}\n` +
            `You can still apply. Adding info may improve your chances.`,
          cta: "update-or-continue",
        };
    }
  }

  const warnUI = warn ? titleAndBodyFromWarn(warn) : null;

  return (
    <>
      <Button onClick={handleApply} disabled={disabled || isPending}>
        {isPending ? "Checking..." : "Apply"}
      </Button>

      {/* 提醒/阻擋彈窗 */}
      <AlertDialog open={openWarn} onOpenChange={setOpenWarn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{warnUI?.title ?? "Before you apply"}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {warnUI?.body ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {warn && warnUI?.cta === "update" && (
              <>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setOpenWarn(false);
                      router.push("/profile/edit-profile");
                    }}
                  >
                    Update profile
                  </Button>
                </AlertDialogAction>
              </>
            )}

            {warn && warnUI?.cta === "close" && (
              <>
                <AlertDialogCancel onClick={() => setOpenWarn(false)}>Close</AlertDialogCancel>
              </>
            )}

            {warn && warnUI?.cta === "continue-only" && (
              <>
                <AlertDialogCancel onClick={proceedAfterWarn}>Continue</AlertDialogCancel>
              </>
            )}

            {warn && warnUI?.cta === "update-or-continue" && (
              <>
                <AlertDialogCancel onClick={proceedAfterWarn}>
                  Continue without updating
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    onClick={() => {
                      setOpenWarn(false);
                      router.push("/profile/edit-profile");
                    }}
                  >
                    Update profile
                  </Button>
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 沒表單的二次確認 */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your application?</AlertDialogTitle>
            <AlertDialogDescription>
              You’re about to apply to this study. You may be contacted by the researcher if selected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApply} disabled={isPending}>
              {isPending ? "Applying..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
