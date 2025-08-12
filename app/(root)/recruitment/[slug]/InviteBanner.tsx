// app/recruitment/[slug]/InviteBanner.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { declineInvitationById } from "@/lib/actions/participation.actions";

export default function InviteBanner({ invitationId }: { invitationId: string }) {
  const [isPending, start] = useTransition();
  const router = useRouter();

  return (
    <Alert className="mb-4">
      <AlertTitle>You’ve been invited</AlertTitle>
      <AlertDescription className="mt-2 flex items-center gap-2">
        The researcher invited you to this study.
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            start(async () => {
              await declineInvitationById(invitationId);
              router.refresh();
            })
          }
        >
          {isPending ? "Processing..." : "Decline"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
