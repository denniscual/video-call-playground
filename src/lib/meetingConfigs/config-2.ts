import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import type { MeetingConfigArgs } from "./types";

export function config2(args: MeetingConfigArgs): MeetingSessionConfiguration {
  const meetingSessionConfiguration = new MeetingSessionConfiguration(
    args.Meeting,
    args.Attendee,
  );

  // High quality configuration - enhanced video settings
  // Optimized for higher bandwidth scenarios
  // meetingSessionConfiguration.videoDownlinkBandwidthPolicy = {
  //   // Configure for higher video quality
  // } as any;
  //
  // meetingSessionConfiguration.videoUplinkBandwidthPolicy = {
  //   // Configure for higher upload quality
  // } as any;

  return meetingSessionConfiguration;
}
