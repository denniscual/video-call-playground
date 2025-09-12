import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";

export interface MeetingConfig {
  id: string;
  name: string;
  description: string;
  config: (args: MeetingConfigArgs) => MeetingSessionConfiguration;
}

export interface CustomConnectionHealthConfig {
  connectionUnhealthyThreshold?: number;
  connectionWaitTimeMs?: number;
  noSignalThresholdTimeMs?: number;
  cooldownTimeMs?: number;
  maximumTimesToWarn?: number;
  goodSignalTimeMs?: number;
  oneBarWeakSignalTimeMs?: number;
  twoBarsTimeMs?: number;
  threeBarsTimeMs?: number;
  fourBarsTimeMs?: number;
  fiveBarsTimeMs?: number;
  zeroBarsNoSignalTimeMs?: number;
  fractionalLoss?: number;
  packetsExpected?: number;
  pastSamplesToConsider?: number;
  missedPongsLowerThreshold?: number;
  missedPongsUpperThreshold?: number;
  sendingAudioFailureInitialWaitTimeMs?: number;
  sendingAudioFailureSamplesToConsider?: number;
}

export interface MeetingConfigArgs {
  Meeting: any;
  Attendee: {
    AttendeeId: string;
    JoinToken: string;
    ExternalUserId: string;
  };
  customConnectionHealthConfig?: CustomConnectionHealthConfig;
}