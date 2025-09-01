"use client";

import { deleteMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

interface DeleteMeetingButtonProps {
  meetingId: string;
}

export function DeleteMeetingButton({ meetingId }: DeleteMeetingButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMeeting(meetingId);
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleDelete}
      variant="destructive"
      size="sm"
    >
      {isPending ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Deleting
        </>
      ) : (
        "Delete"
      )}
    </Button>
  );
}
