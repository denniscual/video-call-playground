import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Meetings List Loading */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Meetings</h2>
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner />
              <span>Loading meetings...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}