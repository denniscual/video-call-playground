import {
  ConnectionHealthPolicyConfiguration,
  ConsoleLogger,
  MeetingSessionConfiguration,
  NScaleVideoUplinkBandwidthPolicy,
  ServerSideNetworkAdaption,
  VideoPriorityBasedPolicy,
  VideoPriorityBasedPolicyConfig,
} from "amazon-chime-sdk-js";
import browserDetect from "browser-detect";
import { MeetingConfigArgs, CustomConnectionHealthConfig } from "./types";

export function config(args: MeetingConfigArgs): MeetingSessionConfiguration {
  const meetingSessionConfiguration = new MeetingSessionConfiguration(
    args.Meeting,
    args.Attendee,
  );

  /**
   * Configure connection health policy with custom overrides
   * Uses AWS Chime defaults as baseline with user overrides from localStorage
   */
  meetingSessionConfiguration.connectionHealthPolicyConfiguration =
    createCustomConnectionConfig(args.customConnectionHealthConfig);

  return meetingSessionConfiguration;
}

/**
 * Creates connection health policy configuration with AWS Chime defaults
 * and optional custom overrides from the user form
 *
 * Only applies custom values when they are defined (not null/undefined)
 * Uses AWS Chime SDK default values as baseline
 */
const createCustomConnectionConfig = (
  customConfig?: CustomConnectionHealthConfig,
): ConnectionHealthPolicyConfiguration => {
  const config = new ConnectionHealthPolicyConfiguration();

  // AWS Chime SDK default values (from comments in cp.ts)
  const defaults = {
    connectionUnhealthyThreshold: 25,
    connectionWaitTimeMs: 10000,
    noSignalThresholdTimeMs: 10000,
    cooldownTimeMs: 60000,
    maximumTimesToWarn: 2,
    goodSignalTimeMs: 15000,
    oneBarWeakSignalTimeMs: 5000,
    twoBarsTimeMs: 5000,
    threeBarsTimeMs: 10000,
    fourBarsTimeMs: 20000,
    fiveBarsTimeMs: 60000,
    zeroBarsNoSignalTimeMs: 5000,
    fractionalLoss: 0.5,
    packetsExpected: 50,
    pastSamplesToConsider: 15,
    missedPongsLowerThreshold: 1,
    missedPongsUpperThreshold: 4,
    sendingAudioFailureInitialWaitTimeMs: 3000,
    sendingAudioFailureSamplesToConsider: 2,
  };

  // Load custom values from localStorage if not provided in args
  let customValues = customConfig;
  if (!customValues && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("chime-custom-connection-health");
      if (stored) {
        customValues = JSON.parse(stored);
      }
    } catch (error) {
      console.warn(
        "Failed to load custom connection health config from localStorage:",
        error,
      );
    }
  }

  console.log("video-logs", { customValues });

  // Apply values, using custom overrides when defined, falling back to AWS defaults
  config.connectionUnhealthyThreshold =
    customValues?.connectionUnhealthyThreshold ??
    defaults.connectionUnhealthyThreshold;
  config.connectionWaitTimeMs =
    customValues?.connectionWaitTimeMs ?? defaults.connectionWaitTimeMs;
  config.noSignalThresholdTimeMs =
    customValues?.noSignalThresholdTimeMs ?? defaults.noSignalThresholdTimeMs;
  config.cooldownTimeMs =
    customValues?.cooldownTimeMs ?? defaults.cooldownTimeMs;
  config.maximumTimesToWarn =
    customValues?.maximumTimesToWarn ?? defaults.maximumTimesToWarn;
  config.goodSignalTimeMs =
    customValues?.goodSignalTimeMs ?? defaults.goodSignalTimeMs;
  config.oneBarWeakSignalTimeMs =
    customValues?.oneBarWeakSignalTimeMs ?? defaults.oneBarWeakSignalTimeMs;
  config.twoBarsTimeMs = customValues?.twoBarsTimeMs ?? defaults.twoBarsTimeMs;
  config.threeBarsTimeMs =
    customValues?.threeBarsTimeMs ?? defaults.threeBarsTimeMs;
  config.fourBarsTimeMs =
    customValues?.fourBarsTimeMs ?? defaults.fourBarsTimeMs;
  config.fiveBarsTimeMs =
    customValues?.fiveBarsTimeMs ?? defaults.fiveBarsTimeMs;
  config.zeroBarsNoSignalTimeMs =
    customValues?.zeroBarsNoSignalTimeMs ?? defaults.zeroBarsNoSignalTimeMs;
  config.fractionalLoss =
    customValues?.fractionalLoss ?? defaults.fractionalLoss;
  config.packetsExpected =
    customValues?.packetsExpected ?? defaults.packetsExpected;
  config.pastSamplesToConsider =
    customValues?.pastSamplesToConsider ?? defaults.pastSamplesToConsider;
  config.missedPongsLowerThreshold =
    customValues?.missedPongsLowerThreshold ??
    defaults.missedPongsLowerThreshold;
  config.missedPongsUpperThreshold =
    customValues?.missedPongsUpperThreshold ??
    defaults.missedPongsUpperThreshold;
  config.sendingAudioFailureInitialWaitTimeMs =
    customValues?.sendingAudioFailureInitialWaitTimeMs ??
    defaults.sendingAudioFailureInitialWaitTimeMs;
  config.sendingAudioFailureSamplesToConsider =
    customValues?.sendingAudioFailureSamplesToConsider ??
    defaults.sendingAudioFailureSamplesToConsider;

  return config;
};

/**
 * Configure simulcast based on browser compatibility
 * Simulcast is only supported on Chromium-based browsers (Chrome, Edge)
 * For other browsers, simulcast should be disabled.
 */
const enableSimulcast = (config: MeetingSessionConfiguration) => {
  const browserInfo = browserDetect();

  if (browserInfo.name === "chrome" || browserInfo.name === "edge") {
    // Enable simulcast for Chromium browsers
    config.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true;
  } else {
    // Disable simulcast for non-Chromium browsers
    config.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = false;
  }
};
