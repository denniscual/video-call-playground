"use client";

import { useSearchParams } from "next/navigation";
import { Meeting } from "@/components/meeting";
import type { MeetingWithAttendees } from "@/lib/actions/meetings";
import type { GetMeetingCommandOutput } from "@aws-sdk/client-chime-sdk-meetings";
import { MeetingProvider } from "amazon-chime-sdk-component-library-react";

interface JoinCallPageClientProps {
  meeting: {
    result: MeetingWithAttendees;
    meeting: GetMeetingCommandOutput;
  };
}

export default function JoinCallPageClient({
  meeting,
}: JoinCallPageClientProps) {
  const searchParams = useSearchParams();
  const participantId = searchParams.get("participantId");

  // Validate participant ID
  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Missing Participant ID</h1>
          <p className="text-muted-foreground">
            You need to provide a participantId to join the meeting.
          </p>
          <p className="text-sm text-muted-foreground">
            Add ?participantId=your-id to the URL
          </p>
        </div>
      </div>
    );
  }

  const { result, meeting: chimeMeeting } = meeting;

  // Find the attendee data for this participant
  const attendee = result.attendees?.find((att) => {
    return att.externalUserId === participantId;
  });
  const isHost = attendee?.participant.type === "host";

  if (!attendee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Attendee Not Found</h1>
          <p className="text-muted-foreground">
            No {isHost ? "host" : "non-host"} attendee found for this meeting.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Participant ID: {participantId}</p>
            <p>Looking for: {isHost ? "host" : "non-host"} attendee</p>
            <p>Available attendees: {result.attendees?.length || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MeetingProvider>
      <Meeting
        chimeMeeting={chimeMeeting}
        meeting={result}
        attendee={attendee}
        participantType={isHost ? "host" : "non-host"}
        participantId={participantId}
      />
    </MeetingProvider>
  );
}
