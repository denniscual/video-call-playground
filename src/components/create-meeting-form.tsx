"use client";

import { createLegacyMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";

export function CreateMeetingForm() {
  const [, formAction, isPending] = useActionState(
    async (_: null, formData: FormData) => {
      await createLegacyMeeting(formData);
      return _;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Input
          name="title"
          placeholder="Meeting title (optional)"
          className="w-full"
          disabled={isPending}
        />
        <Input
          name="meeting_url"
          placeholder="Enter meeting URL"
          required
          className="w-full"
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Creating...
          </>
        ) : (
          "Create Meeting"
        )}
      </Button>
    </form>
  );
}
