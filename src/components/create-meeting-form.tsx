"use client";

import { createMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

export function CreateMeetingForm() {
  const router = useRouter();

  const [, formAction, isPending] = useActionState(async () => {
    const result = await createMeeting();
    if (result.meetingId) {
      router.push(`/meeting/${result.id}`);
    }
    return null;
  }, null);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Creating meeting...
          </>
        ) : (
          "Create meeting"
        )}
      </Button>
    </form>
  );
}
