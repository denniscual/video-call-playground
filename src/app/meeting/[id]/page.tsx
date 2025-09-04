import { getMeetingById } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hardcodedSupabaseParticipants } from "@/lib/utils";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { id } = await params;
  const response = await getMeetingById(id);

  if (!response) {
    notFound();
  }

  const { result: meeting } = response;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {meeting.externalMeetingId || "Meeting Details"}
            </h1>
            <p className="text-muted-foreground mt-2">
              View meeting details • {meeting.attendees?.length || 0}{" "}
              attendee(s)
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {meeting.externalMeetingId || `Meeting ${meeting.id.slice(0, 8)}`}
            </CardTitle>
            <CardDescription>
              Created: {new Date(meeting.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Database ID (Primary Key)
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">{meeting.id}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this ID to join the meeting
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">External Meeting ID</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-mono text-sm break-all text-blue-900">
                  {meeting.externalMeetingId}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Human-readable meeting identifier
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Join Call URLs</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Host URL
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-mono text-xs break-all">
                      /join-call/{meeting.id}
                      ?participantId={hardcodedSupabaseParticipants.host.id}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Non-Host URL
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-mono text-xs break-all">
                      /join-call/{meeting.id}
                      ?participantId={hardcodedSupabaseParticipants.nonHost.id}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Copy these URLs to join the meeting as host or participant
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    AWS Chime Meeting ID
                  </p>
                  <p className="font-mono text-xs">{meeting.meetingId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Database ID
                  </p>
                  <p className="font-mono text-xs">{meeting.id}</p>
                </div>
                {meeting.mediaRegion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Media Region
                    </p>
                    <p className="text-sm">{meeting.mediaRegion}</p>
                  </div>
                )}
                {meeting.meetingHostId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Meeting Host ID
                    </p>
                    <p className="font-mono text-xs">{meeting.meetingHostId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p className="text-sm">
                    {new Date(meeting.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {new Date(meeting.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <div className="flex gap-2 flex-1">
                <Button asChild className="flex-1">
                  <Link
                    href={`/join-call/${meeting.id}?participantId=${hardcodedSupabaseParticipants.host.id}`}
                  >
                    Join as Host
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="flex-1">
                  <Link
                    href={`/join-call/${meeting.id}?participantId=${hardcodedSupabaseParticipants.nonHost.id}`}
                  >
                    Join as Participant
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              Meeting Attendees ({meeting.attendees?.length || 0})
            </CardTitle>
            <CardDescription>Participants in this meeting</CardDescription>
          </CardHeader>
          <CardContent>
            {!meeting.attendees || meeting.attendees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No attendees found for this meeting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meeting.attendees.map((attendee, index) => (
                  <div key={attendee.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {attendee.participant?.name ||
                              `Attendee ${index + 1}`}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendee.participant?.type === "host"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {attendee.participant?.type === "host"
                              ? "Host"
                              : "Participant"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Participant ID
                          </p>
                          <p className="font-mono text-xs">
                            {attendee.externalUserId}
                          </p>
                        </div>
                        {attendee.attendeeId && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Attendee ID
                            </p>
                            <p className="font-mono text-xs">
                              {attendee.attendeeId}
                            </p>
                          </div>
                        )}
                        {attendee.joinToken && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Join Token
                            </p>
                            <p className="font-mono text-xs truncate max-w-xs">
                              {attendee.joinToken.substring(0, 20)}...
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(attendee.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
