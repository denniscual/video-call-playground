"use server";

import { db } from "@/lib/db";
import { meetings, attendees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import {
	CreateMeetingCommand,
	CreateAttendeeCommand,
	GetMeetingCommand,
	GetMeetingCommandOutput,
	DeleteMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";
import { getChimeSDKMeetingsClient } from "@/lib/aws/chime-client";
import { v4 as uuidv4 } from "uuid";
import { capitalToLower } from "@/lib/utils/case-transform";
import type { Meeting, Attendee, Participant } from "@/lib/db/schema";
import { hardcodedAwsParticipants } from "../util";

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
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Authentication required");
	}

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
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Authentication required");
	}

	try {
		const client = getChimeSDKMeetingsClient();
		const region = process.env.NEXT_PUBLIC_AWS_CHIME_REGION!;
		// TODO: Replace this with dynamic data.
		// This data is coming from the actual participatns table data.
		const hardcodedParticipants = hardcodedAwsParticipants;

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

		// Return the created meeting ID for navigation
		return createdMeeting;
	} catch (error) {
		console.error("❌ Error creating meeting:", error);
		throw new Error("Failed to create meeting");
	}
}

export async function deleteMeeting(id: string) {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Authentication required");
	}

	try {
		// First, get the meeting to extract the AWS meetingId
		const meetingToDelete = await db.query.meetings.findFirst({
			where: eq(meetings.id, id),
		});

		if (!meetingToDelete) {
			throw new Error("Meeting not found");
		}

		// Delete attendees first (foreign key constraint)
		await db.delete(attendees).where(eq(attendees.meetingId, id));

		// Then delete the meeting
		await db.delete(meetings).where(eq(meetings.id, id));

		// Deletes the specified Amazon Chime SDK meeting. The operation deletes all attendees, disconnects all clients, and prevents new clients from joining the meeting.
		// Docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/chime-sdk-meetings/command/DeleteMeetingCommand/

		const client = getChimeSDKMeetingsClient();
		await client.send(
			new DeleteMeetingCommand({
				MeetingId: meetingToDelete.meetingId, // this id holds the aws chime meeting id.
			}),
		);

		revalidatePath("/");
	} catch (error) {
		console.error("Error deleting meeting:", error);
		throw new Error("Failed to delete meeting");
	}
}
