import { getAllMeetings } from "@/lib/actions/meetings";
import { CreateMeetingForm } from "@/components/create-meeting-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// TODO:
// - the supabase credential including the project url and api key got exposed in the git commit history.
//   WE must generate new api key.
export default async function Home() {
  const meetings = await getAllMeetings();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Video Call Playground</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your video call meetings
            </p>
          </div>
        </div>

        {/* AWS Chime Meeting Creation */}
        <Card>
          <CardContent>
            <CreateMeetingForm />
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
                      {meeting.externalMeetingId ||
                        `Meeting ${meeting.id.slice(0, 8)}`}
                    </CardTitle>
                    <CardDescription>
                      Created: {new Date(meeting.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Meeting ID:</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {meeting.meetingId}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/meeting/${meeting.id}`}>View</Link>
                        </Button>
                        <DeleteMeetingButton meetingId={meeting.id} />
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
