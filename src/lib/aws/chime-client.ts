import { ChimeSDKMeetingsClient } from "@aws-sdk/client-chime-sdk-meetings";

let chimeSDKMeetingsClient: ChimeSDKMeetingsClient | null = null;

export function getChimeSDKMeetingsClient(): ChimeSDKMeetingsClient {
	if (!chimeSDKMeetingsClient) {
		const region = process.env.AWS_REGION;
		const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
		const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

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
