"use server";

import { db } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Meeting } from "@/lib/db/schema";

export async function getAllMeetings(): Promise<Meeting[]> {
  try {
    const result = await db.select().from(meetings).orderBy(desc(meetings.createdAt));
    return result;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    console.error("⚠️  SETUP REQUIRED: Make sure DATABASE_URL is set and the meetings table exists.");
    console.error("📝 Please run the SQL from 'supabase-setup.sql' in your Supabase dashboard:");
    console.error("   1. Go to https://supabase.com/dashboard/project/wpggkfbcmekytsjcrrma/sql");
    console.error("   2. Copy and run the SQL from supabase-setup.sql");
    console.error("   3. Add DATABASE_URL to .env.local with your Supabase connection pooler URL");
    return [];
  }
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  try {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return null;
  }
}

export async function createMeeting(formData: FormData) {
  const meetingUrl = formData.get("meeting_url") as string;

  if (!meetingUrl) {
    throw new Error("Meeting URL is required");
  }

  try {
    await db.insert(meetings).values({
      meetingUrl,
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating meeting:", error);
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