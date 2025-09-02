import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";

export interface MeetingConfig {
  id: string;
  name: string;
  description: string;
  config: (args: MeetingConfigArgs) => MeetingSessionConfiguration;
}

export interface MeetingConfigArgs {
  Meeting: any;
  Attendee: {
    AttendeeId: string;
    JoinToken: string;
    ExternalUserId: string;
  };
}