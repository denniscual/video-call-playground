"use client";

import { createMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTransition, useRef } from "react";

export function CreateMeetingForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createMeeting(formData);
      formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
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