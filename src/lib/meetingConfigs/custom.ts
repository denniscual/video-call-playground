import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import type { MeetingConfigArgs } from "./types";

export function config(args: MeetingConfigArgs): MeetingSessionConfiguration {
  const meetingSessionConfiguration = new MeetingSessionConfiguration(
    args.Meeting,
    args.Attendee,
  );

  // Standard quality configuration - baseline settings
  // This represents the default/current configuration

  return meetingSessionConfiguration;
}
