import { ChimeSDKMeetingsClient } from "@aws-sdk/client-chime-sdk-meetings";

let chimeSDKMeetingsClient: ChimeSDKMeetingsClient | null = null;

export function getChimeSDKMeetingsClient(): ChimeSDKMeetingsClient {
  if (!chimeSDKMeetingsClient) {
    const region = process.env.NEXT_PUBLIC_AWS_CHIME_REGION;
    const accessKeyId = process.env.AWS_CHIME_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_CHIME_SECRET_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error("AWS Chime SDK credentials are not configured");
    }

    chimeSDKMeetingsClient = new ChimeSDKMeetingsClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return chimeSDKMeetingsClient;
}