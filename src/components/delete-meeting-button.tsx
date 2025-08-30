"use client";

import { deleteMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState, useTransition } from "react";

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
      onClick={handleDelete}
      disabled={true}
      variant="destructive" 
      size="sm"
    >
      Delete
    </Button>
  );
}