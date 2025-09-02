import {
	MeetingSessionConfiguration,
	NScaleVideoUplinkBandwidthPolicy,
} from "amazon-chime-sdk-js";
import type { MeetingConfigArgs } from "./types";

export function config3(args: MeetingConfigArgs): MeetingSessionConfiguration {
	const meetingSessionConfiguration = new MeetingSessionConfiguration(
		args.Meeting,
		args.Attendee,
	);

	const uplinkBandwidthPolicy = new NScaleVideoUplinkBandwidthPolicy(
		args.Attendee.ExternalUserId,
	);
	uplinkBandwidthPolicy.setIdealMaxBandwidthKbps(150);
	meetingSessionConfiguration.videoUplinkBandwidthPolicy =
		uplinkBandwidthPolicy;

	console.log("video-logs", "low bandwidth");

	// Low bandwidth configuration - optimized for poor connections
	// Reduced video quality to maintain stable connection
	// meetingSessionConfiguration.videoDownlinkBandwidthPolicy = {
	//   // Configure for lower bandwidth usage
	// } as any;
	//
	// meetingSessionConfiguration.videoUplinkBandwidthPolicy = {
	//   // Configure for lower upload bandwidth
	// } as any;

	return meetingSessionConfiguration;
}
