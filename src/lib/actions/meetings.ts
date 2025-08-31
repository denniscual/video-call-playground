"use server";

import { db } from "@/lib/db";
import { meetings, attendees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  CreateMeetingCommand,
  CreateAttendeeCommand,
  GetMeetingCommand,
  GetMeetingCommandOutput,
} from "@aws-sdk/client-chime-sdk-meetings";
import { getChimeSDKMeetingsClient } from "@/lib/aws/chime-client";
import { v4 as uuidv4 } from "uuid";
import { capitalToLower } from "@/lib/utils/case-transform";
import type { Meeting, Attendee, Participant } from "@/lib/db/schema";

// Type for meeting with attendees and participant details
export type MeetingWithAttendees = Meeting & {
  attendees: Array<
    Attendee & {
      participant: Participant;
    }
  >;
};

export async function getAllMeetings(): Promise<Meeting[]> {
  try {
    const result = await db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.createdAt));
    return result;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    console.error(
      "⚠️  SETUP REQUIRED: Make sure DATABASE_URL is set and the meetings table exists.",
    );
    console.error(
      "📝 Please run the SQL from 'supabase-setup.sql' in your Supabase dashboard:",
    );
    console.error(
      "   1. Go to https://supabase.com/dashboard/project/wpggkfbcmekytsjcrrma/sql",
    );
    console.error("   2. Copy and run the SQL from supabase-setup.sql");
    console.error(
      "   3. Add DATABASE_URL to .env.local with your Supabase connection pooler URL",
    );
    return [];
  }
}

export async function getMeetingById(id: string): Promise<{
  result: MeetingWithAttendees;
  meeting: GetMeetingCommandOutput; // AWS Chime meeting instance
} | null> {
  try {
    const result = await db.query.meetings.findFirst({
      where: eq(meetings.id, id),
      with: {
        attendees: {
          with: {
            participant: true,
          },
        },
      },
    });

    const client = getChimeSDKMeetingsClient();
    const getMeetingResponse = await client.send(
      new GetMeetingCommand({
        MeetingId: result?.meetingId,
      }),
    );

    return {
      result: result!,
      meeting: getMeetingResponse,
    };
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return null;
  }
}

export async function createLegacyMeeting(formData: FormData) {
  const meetingUrl = formData.get("meeting_url") as string;
  const title = formData.get("title") as string;

  if (!meetingUrl) {
    throw new Error("Meeting URL is required");
  }

  try {
    await db.insert(meetings).values({
      meetingId: `legacy-${uuidv4()}`,
      externalMeetingId: title || `legacy-meeting-${uuidv4().substring(0, 8)}`,
      mediaRegion: "us-east-1",
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating legacy meeting:", error);
    throw new Error("Failed to create meeting");
  }
}

export async function createMeeting() {
  try {
    const client = getChimeSDKMeetingsClient();
    const region = process.env.NEXT_PUBLIC_AWS_CHIME_REGION!;
    // TODO: Replace this with dynamic data.
    // This data is coming from the actual participatns table data.
    const hardcodedParticipants = {
      host: {
        id: "763e07ad-2d49-4dab-8d5f-fb0b505da275",
      },
      nonHost: {
        id: "76e6aaa3-1dbe-451c-b8e6-6cb87366d0fe",
      },
    };

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

    // Create host
    const hostAttendeeInput = {
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId: hardcodedParticipants.host.id,
      Capabilities: {
        Audio: "SendReceive" as const,
        Video: "SendReceive" as const,
        Content: "SendReceive" as const,
      },
    };
    const hostAttendeeResponse = await client.send(
      new CreateAttendeeCommand(hostAttendeeInput),
    );

    // Create non-host
    const nonHostAttendeeInput = {
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId: hardcodedParticipants.nonHost.id,
      Capabilities: {
        Audio: "SendReceive" as const,
        Video: "SendReceive" as const,
        Content: "SendReceive" as const,
      },
    };
    const nonHostAttendeeResponse = await client.send(
      new CreateAttendeeCommand(nonHostAttendeeInput),
    );

    if (!hostAttendeeResponse.Attendee || !nonHostAttendeeResponse.Attendee) {
      throw new Error("Failed to create attendee");
    }

    const transformedMeeting = capitalToLower(meetingResponse.Meeting);
    const transformedHostAttendee = capitalToLower(
      hostAttendeeResponse.Attendee,
    );
    const transformedNonHostAttendee = capitalToLower(
      nonHostAttendeeResponse.Attendee,
    );

    const [createdMeeting] = await db
      .insert(meetings)
      .values({
        meetingId: transformedMeeting.meetingId,
        meetingHostId: transformedMeeting.meetingHostId || null,
        externalMeetingId: transformedMeeting.externalMeetingId,
        mediaRegion: transformedMeeting.mediaRegion || null,
        primaryMeetingId: transformedMeeting.primaryMeetingId || null,
      })
      .returning();

    // Save attendees data (both host and non-host)
    await db
      .insert(attendees)
      .values([
        {
          // Host
          meetingId: createdMeeting.id,
          externalUserId: transformedHostAttendee.externalUserId,
          attendeeId: transformedHostAttendee.attendeeId || null,
          joinToken: transformedHostAttendee.joinToken || null,
        },
        {
          // Non-host
          meetingId: createdMeeting.id,
          externalUserId: transformedNonHostAttendee.externalUserId,
          attendeeId: transformedNonHostAttendee.attendeeId || null,
          joinToken: transformedNonHostAttendee.joinToken || null,
        },
      ])
      .returning();

    console.log("✅ AWS Chime meeting created and saved to database:");
    console.log("Meeting ID:", transformedMeeting.meetingId);
    console.log("External Meeting ID:", transformedMeeting.externalMeetingId);
    console.log("Host Attendee ID:", transformedHostAttendee.attendeeId);
    console.log("Non-host Attendee ID:", transformedNonHostAttendee.attendeeId);
    console.log("Host ID:", transformedHostAttendee.externalUserId);
    console.log("Non-host ID:", transformedNonHostAttendee.externalUserId);

    revalidatePath("/");
  } catch (error) {
    console.error("❌ Error creating meeting:", error);
    throw new Error("Failed to create meeting");
  }
}

export async function deleteMeeting(id: string) {
  try {
    await db.delete(meetings).where(eq(meetings.id, id));
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting meeting:", error);
    throw new Error("Failed to delete meeting");
  }
}
