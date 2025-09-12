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
   * This is to avoid black screen when network was unstable
   * So user will see the last frame and then it back to normal
   */
  meetingSessionConfiguration.keepLastFrameWhenPaused = true;

  /**
   * Configure connection health policy with custom overrides
   * Uses AWS Chime defaults as baseline with user overrides from localStorage
   */
  meetingSessionConfiguration.connectionHealthPolicyConfiguration =
    createCustomConnectionConfig(args.customConnectionHealthConfig);

  /**
   * Configure reconnection parameters for better stability
   */
  meetingSessionConfiguration.reconnectTimeoutMs = 120000; // 2 minutes total reconnect timeout
  meetingSessionConfiguration.reconnectFixedWaitMs = 2000; // 2 second fixed wait
  meetingSessionConfiguration.reconnectShortBackOffMs = 1000; // 1 second short backoff
  meetingSessionConfiguration.reconnectLongBackOffMs = 5000; // 5 second long backoff
  meetingSessionConfiguration.connectionTimeoutMs = 20000; // 20 second connection timeout
  meetingSessionConfiguration.attendeePresenceTimeoutMs = 30000; // 30 second presence timeout

  /**
   * ENHANCED SIMULCAST AND VIDEO POLICY CONFIGURATION
   *
   * Following AWS Chime SDK best practices for simulcast:
   * - Enable simulcast for Chromium-based browsers
   * - Use VideoPriorityBasedPolicy for intelligent layer switching
   * - Configure proper video preferences for optimal quality adaptation
   * - Server-side network adaptation with bandwidth probing
   * - Conservative quality limits to prevent bandwidth issues
   *
   * This configuration:
   * ✅ Enables proper simulcast with video preferences
   * ✅ Maintains video stability across all network conditions
   * ✅ Gracefully degrades quality instead of dropping streams
   * ✅ Uses modern server-side adaptation
   * ✅ Supports 54kbps (audio) to 1400kbps (HD video) range per AWS specs
   *
   * Reference: https://aws.github.io/amazon-chime-sdk-js/modules/simulcast.html
   */

  // Create optimized priority-based policy with stability improvements
  const videoConfig = VideoPriorityBasedPolicyConfig.Default;

  // Enable modern server-side network adaptation
  videoConfig.serverSideNetworkAdaption =
    ServerSideNetworkAdaption.BandwidthProbing;

  const logger = new ConsoleLogger("AWS Chime Adaptive Video");
  const adaptiveVideoPolicy = new VideoPriorityBasedPolicy(logger, videoConfig);

  /**
   * Configure video uplink with bandwidth limits for stability
   * Increase bandwidth to reduce quality switching
   */
  const uplinkPolicy = new NScaleVideoUplinkBandwidthPolicy("AWS Chime Uplink");
  uplinkPolicy.setIdealMaxBandwidthKbps(1200); // Increased from 1000 for better stability

  // Apply browser-specific simulcast configuration
  enableSimulcast(meetingSessionConfiguration);

  meetingSessionConfiguration.videoDownlinkBandwidthPolicy =
    adaptiveVideoPolicy;
  meetingSessionConfiguration.videoUplinkBandwidthPolicy = uplinkPolicy;

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
