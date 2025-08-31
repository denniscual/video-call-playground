import { getMeetingById } from "@/lib/actions/meetings";
import { notFound } from "next/navigation";
import JoinCallPageClient from "./join-call-client";

export default async function JoinCallPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;

  console.log({ meetingId });

  // Get meeting data
  console.log("🔍 Looking for meeting with ID:", meetingId);
  const response = await getMeetingById(meetingId);

  if (!response) {
    console.log("❌ Meeting not found with ID:", meetingId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Meeting Not Found</h1>
          <p className="text-muted-foreground">
            No meeting found with ID: {meetingId}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              Create a meeting first, then use its ID to join
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <JoinCallPageClient meeting={response} />;
}
