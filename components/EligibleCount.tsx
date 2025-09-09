"use client";

import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import type { StudyFullInput } from "@/types";
import { Button } from "@/components/ui/button";
import { toCriteriaArray } from "@/components/stepper-with-form"; 

export function EligibleCountButton() {
  const { getValues } = useFormContext<StudyFullInput>();
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onEstimate = () => {
    setErr(null);
    start(async () => {
      try {
        const ui = getValues("criteria");
        const criteria = toCriteriaArray(ui); 

        const res = await fetch("/api/eligibility/count", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to estimate");

        setCount(data.count ?? 0);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
        setErr(msg);
        setCount(null);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button type="button" onClick={onEstimate} disabled={pending}>
        {pending ? "Checking…" : "Estimate"}
      </Button>
       <span className="text-sm text-muted-foreground">Eligible Count</span>
      {count != null ? (
        <span className="text-sm text-muted-foreground">≈ {count} profiles</span>
      ) : <>-</>}
      {err && <span className="text-sm text-destructive">{err}</span>}
    </div>
  );
}
