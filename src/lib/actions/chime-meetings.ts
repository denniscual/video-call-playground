"use server";

import { CreateMeetingCommand, CreateAttendeeCommand } from "@aws-sdk/client-chime-sdk-meetings";
import { getChimeSDKMeetingsClient } from "@/lib/aws/chime-client";
import { v4 as uuidv4 } from "uuid";

export async function createChimeMeeting() {
  try {
    const client = getChimeSDKMeetingsClient();
    const region = process.env.NEXT_PUBLIC_AWS_CHIME_REGION!;
    
    const meetingInput = {
      ClientRequestToken: uuidv4(),
      MediaRegion: region,
      ExternalMeetingId: `meeting-${uuidv4().substring(0, 8)}`,
    };

    const createMeetingCommand = new CreateMeetingCommand(meetingInput);
    const meetingResponse = await client.send(createMeetingCommand);

    if (!meetingResponse.Meeting?.MeetingId) {
      throw new Error("Failed to create meeting - no MeetingId returned");
    }

    const attendeeInput = {
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId: uuidv4(),
      Capabilities: {
        Audio: "SendReceive" as const,
        Video: "SendReceive" as const,
        Content: "SendReceive" as const,
      },
    };

    const createAttendeeCommand = new CreateAttendeeCommand(attendeeInput);
    const attendeeResponse = await client.send(createAttendeeCommand);

    console.log("✅ AWS Chime meeting created successfully:");
    console.log("Meeting ID:", meetingResponse.Meeting.MeetingId);
    console.log("External Meeting ID:", meetingResponse.Meeting.ExternalMeetingId);
    console.log("Attendee ID:", attendeeResponse.Attendee?.AttendeeId);
    console.log("External User ID:", attendeeResponse.Attendee?.ExternalUserId);
  } catch (error) {
    console.error("❌ Error creating Chime meeting:", error);
  }
}