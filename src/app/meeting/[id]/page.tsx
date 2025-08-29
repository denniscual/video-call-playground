import { getMeetingById } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MeetingPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const meeting = await getMeetingById(params.id);

  if (!meeting) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meeting Details</h1>
            <p className="text-muted-foreground mt-2">
              View and manage this meeting
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meeting {meeting.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              Created: {new Date(meeting.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Meeting URL</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">
                  {meeting.meetingUrl}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meeting ID</p>
                  <p className="font-mono text-sm">{meeting.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{new Date(meeting.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button asChild className="flex-1">
                <a 
                  href={meeting.meetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Join Meeting
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}