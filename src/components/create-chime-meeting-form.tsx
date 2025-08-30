"use client";

import { createMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";

export function CreateChimeMeetingForm() {
  const [, formAction, isPending] = useActionState(
    async () => {
      await createMeeting();
      return null;
    },
    null,
  );

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