import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Video Call Playground</h1>
          <p className="text-muted-foreground mt-2">
            Create your video call meetings
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner />
            <span>Loading meetings...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
