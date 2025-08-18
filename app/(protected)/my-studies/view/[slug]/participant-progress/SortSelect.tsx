// app/(root)/recruitment/[slug]/SortSelect.tsx
"use client";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { v: "score_desc", label: "Score (high → low)" },
  { v: "score_asc", label: "Score (low → high)" },
  { v: "manual_pass_desc", label: "Manual ✓ count" },
  { v: "criteria_desc", label: "Criteria match score" },
  { v: "applied_newest", label: "Applied (newest)" },
  { v: "applied_oldest", label: "Applied (oldest)" },
  { v: "name_az", label: "Name A→Z" },
] as const;

export default function SortSelect({ value }: { value: string | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = (v: string) => {
    const next = new URLSearchParams(sp?.toString() ?? "");
    next.set("sort", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort</span>
      <Select value={value ?? "score_desc"} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map(o => (
            <SelectItem key={o.v} value={o.v}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
