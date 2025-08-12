"use client";

import { useTransition, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { useStudy } from "../StudyProviderClient";
import { patchRecruitmentGoal } from "@/lib/actions/study.actions";

export function RecruitmentGoal({ slug }: { slug: string }) {
  const study = useStudy();
  const base = study?.recruitment ?? null;

  const [enabledSelected, setEnabledSelected] = useState(base?.autoCloseSelectedCount != null);
  const [enabledApplicants, setEnabledApplicants] = useState(base?.autoCloseApplicantCount != null);
  const [local, setLocal] = useState({
    selected: base?.autoCloseSelectedCount?.toString() ?? "",
    applicants: base?.autoCloseApplicantCount?.toString() ?? "",
    date: base?.autoCloseDate ? new Date(base.autoCloseDate) : null,
  });

  const [isPending, start] = useTransition();

  // debounce 數字更新
  const commitNumber = useDebouncedCallback(
    (key: "selected" | "applicants", value: string) => {
      const v = value === "" ? null : Math.max(1, Number(value));
      start(async () => {
        await patchRecruitmentGoal(slug, {
          autoCloseSelectedCount: key === "selected" ? v : enabledSelected ? Number(local.selected) : null,
          autoCloseApplicantCount: key === "applicants" ? v : enabledApplicants ? Number(local.applicants) : null,
          autoCloseDate: local.date,
        });
      });
    },
    400
  );

  function toggleSelected(on: boolean) {
    setEnabledSelected(on);
    start(async () => {
      await patchRecruitmentGoal(slug, {
        autoCloseSelectedCount: on ? Math.max(1, Number(local.selected) || 1) : null,
        autoCloseApplicantCount: enabledApplicants ? Number(local.applicants) : null,
        autoCloseDate: local.date,
      });
    });
  }

  function toggleApplicants(on: boolean) {
    setEnabledApplicants(on);
    start(async () => {
      await patchRecruitmentGoal(slug, {
        autoCloseSelectedCount: enabledSelected ? Number(local.selected) : null,
        autoCloseApplicantCount: on ? Math.max(1, Number(local.applicants) || 1) : null,
        autoCloseDate: local.date,
      });
    });
  }

  function setDateValue(d: Date | null) {
    setLocal(s => ({ ...s, date: d }));
    start(async () => {
      await patchRecruitmentGoal(slug, {
        autoCloseSelectedCount: enabledSelected ? Number(local.selected) : null,
        autoCloseApplicantCount: enabledApplicants ? Number(local.applicants) : null,
        autoCloseDate: d,
      });
    });
  }

  return (
    <div className="space-y-3">
      {/* Selected count */}
      <div className="flex items-center gap-3">
        <Switch
          checked={enabledSelected}
          onCheckedChange={toggleSelected}
          disabled={isPending}
        />
        <span>Stop when selected participants reaches</span>
        <Input
          type="number"
          min={1}
          className="w-24"
          disabled={!enabledSelected || isPending}
          value={local.selected}
          onChange={(e) => {
            const raw = e.target.value;
            setLocal(s => ({ ...s, selected: raw }));
            commitNumber("selected", raw);
          }}
        />
      </div>

      {/* Applicant count */}
      <div className="flex items-center gap-3">
        <Switch
          checked={enabledApplicants}
          onCheckedChange={toggleApplicants}
          disabled={isPending}
        />
        <span>Stop when applicants reaches</span>
        <Input
          type="number"
          min={1}
          className="w-24"
          disabled={!enabledApplicants || isPending}
          value={local.applicants}
          onChange={(e) => {
            const raw = e.target.value;
            setLocal(s => ({ ...s, applicants: raw }));
            commitNumber("applicants", raw);
          }}
        />
      </div>

      {/* Date */}
      <div className="flex items-center gap-3">
        <Switch
          checked={local.date != null}
          onCheckedChange={(on) => setDateValue(on ? new Date() : null)}
          disabled={isPending}
        />
        <span>Stop when date reaches</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-52 justify-start"
              disabled={local.date == null || isPending}
            >
              {local.date ? format(local.date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={local.date ?? undefined}
              onSelect={(d) => setDateValue(d ?? null)}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
