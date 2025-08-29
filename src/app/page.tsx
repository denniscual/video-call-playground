import { getAllMeetings, createMeeting, deleteMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const meetings = await getAllMeetings();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Video Call Playground</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your video call meetings
          </p>
        </div>


        {/* Create Meeting Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Meeting</CardTitle>
            <CardDescription>
              Add a new meeting URL to start a video call session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMeeting} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="title"
                  placeholder="Meeting title (optional)"
                  className="w-full"
                />
                <Input
                  name="meeting_url"
                  placeholder="Enter meeting URL"
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">Create Meeting</Button>
            </form>
          </CardContent>
        </Card>

        {/* Meetings List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Meetings</h2>
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No meetings found. Create your first meeting above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {meeting.title || `Meeting ${meeting.id.slice(0, 8)}`}
                    </CardTitle>
                    <CardDescription>
                      Created: {new Date(meeting.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Meeting URL:</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {meeting.meetingUrl}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/meeting/${meeting.id}`}>View</Link>
                        </Button>
                        <form action={deleteMeeting.bind(null, meeting.id)}>
                          <Button type="submit" variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
