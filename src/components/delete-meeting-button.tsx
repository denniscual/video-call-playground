"use client";

import { deleteMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

interface DeleteMeetingButtonProps {
  meetingId: string;
}

export function DeleteMeetingButton({ meetingId }: DeleteMeetingButtonProps) {
  const [, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMeeting(meetingId);
    });
  };

  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Delete
    </Button>
  );
}
