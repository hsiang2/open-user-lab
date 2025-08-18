// RowActions.client.tsx
"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateParticipationStatus } from "@/lib/actions/participation.actions";
import type { ParticipationStatus } from "@prisma/client";

export default function RowActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [which, setWhich] = useState<null | "accept" | "reject">(null);

  function run(next: ParticipationStatus, tag: "accept" | "reject") {
    if (isPending) return;
    setWhich(tag);
    start(async () => {
      await updateParticipationStatus(id, next);
      router.refresh(); // 該列會消失（因為不再是 Applied）
      // 不用 setWhich(null)，refresh 會重渲染
    });
  }

  return (
    <div className="inline-flex gap-2">
      <Button
        variant="destructive"
        disabled={isPending}
        onClick={() => run("Rejected", "reject")}
        size="sm"
      >
        {isPending && which === "reject" ? "Processing..." : "Decline"}
      </Button>
      <Button
        disabled={isPending}
        onClick={() => run("Selected", "accept")}
        size="sm"
      >
        {isPending && which === "accept" ? "Processing..." : "Accept"}
      </Button>
    </div>
  );
}
