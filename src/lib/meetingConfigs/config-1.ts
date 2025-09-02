import {
	MeetingSessionConfiguration,
	NScaleVideoUplinkBandwidthPolicy,
} from "amazon-chime-sdk-js";
import type { MeetingConfigArgs } from "./types";

export function config1(args: MeetingConfigArgs): MeetingSessionConfiguration {
	const meetingSessionConfiguration = new MeetingSessionConfiguration(
		args.Meeting,
		args.Attendee,
	);

	const uplinkBandwidthPolicy = new NScaleVideoUplinkBandwidthPolicy(
		args.Attendee.ExternalUserId,
	);
	uplinkBandwidthPolicy.setIdealMaxBandwidthKbps(600);
	meetingSessionConfiguration.videoUplinkBandwidthPolicy =
		uplinkBandwidthPolicy;

	// Standard quality configuration - baseline settings
	// This represents the default/current configuration

	return meetingSessionConfiguration;
}
