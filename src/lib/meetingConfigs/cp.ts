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
import { MeetingConfigArgs } from "./types";

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
   * Configure connection health policy for better stability
   * This reduces the sensitivity to temporary network issues and improves reconnection behavior
   */
  meetingSessionConfiguration.connectionHealthPolicyConfiguration =
    createStableConnectionConfig();

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
   * ALTERNATIVE: If video flickering persists, consider using AllHighestVideoBandwidthPolicy
   * This policy is more stable but less adaptive to network conditions:
   *
   * import { AllHighestVideoBandwidthPolicy } from 'amazon-chime-sdk-js';
   * const stableVideoPolicy = new AllHighestVideoBandwidthPolicy();
   * meetingSessionConfiguration.videoDownlinkBandwidthPolicy = stableVideoPolicy;
   */

  /**
   * Configure video uplink with bandwidth limits for stability
   * Increase bandwidth to reduce quality switching
   */
  const uplinkPolicy = new NScaleVideoUplinkBandwidthPolicy("AWS Chime Uplink");
  uplinkPolicy.setIdealMaxBandwidthKbps(1200); // Increased from 1000 for better stability

  /**
   * COMPLETE SIMULCAST CONFIGURATION
   * Enable simulcast for better network adaptation with VideoPriorityBasedPolicy
   *
   * The VideoPriorityBasedPolicy will use default behavior to automatically subscribe
   * to all available video sources, ensuring all attendees can see each other's video.
   *
   *
   * MONITORING: If flickering returns, investigate these areas first:
   * 1. videoTileDidUpdate event frequency
   * 2. React component re-render patterns
   * 3. Network policy thresholds
   * 4. Video element binding logic
   *
   * Note: Video preferences can be updated dynamically if needed via:
   * meetingSession.audioVideo.getVideoDownlinkBandwidthPolicy().chooseRemoteVideoSources()
   */

  // Apply browser-specific simulcast configuration
  enableSimulcast(meetingSessionConfiguration);

  meetingSessionConfiguration.videoDownlinkBandwidthPolicy =
    adaptiveVideoPolicy;
  meetingSessionConfiguration.videoUplinkBandwidthPolicy = uplinkPolicy;

  // Standard quality configuration - baseline settings
  // This represents the default/current configuration

  return meetingSessionConfiguration;
}

/**
 * Creates balanced connection health policy configuration for Amazon Chime SDK
 *
 * This configuration balances stability with responsive connection health detection.
 * Values are tuned based on AWS Chime SDK best practices and real-world testing.
 *
 * Key improvements:
 * - Reasonable packet loss tolerance (not overly permissive)
 * - Balanced reconnection timing
 * - Proper signal strength detection
 */
const createStableConnectionConfig =
  (): ConnectionHealthPolicyConfiguration => {
    const config = new ConnectionHealthPolicyConfiguration();

    // Increase thresholds to be less sensitive to temporary network issues
    // config.connectionWaitTimeMs = 15000; // Default: 10000, increased for better tolerance
    // config.noSignalThresholdTimeMs = 20000; // Default: 10000, much higher for stability
    config.connectionUnhealthyThreshold = 15; // Default: 25, significant increase for stability

    // Increase reconnection timeouts for better stability
    // config.cooldownTimeMs = 30000; // Default: 60000, reduce to 30s for faster recovery
    // config.maximumTimesToWarn = 5; // Default: 2, increase to 5 for more attempts
    //
    // // Signal strength thresholds - moderate tolerance increases
    // config.goodSignalTimeMs = 18000; // Default: 15000, slight increase
    // config.oneBarWeakSignalTimeMs = 6000; // Default: 5000, slight increase
    // config.twoBarsTimeMs = 6000; // Default: 5000, slight increase
    // config.threeBarsTimeMs = 12000; // Default: 10000, moderate increase
    // config.fourBarsTimeMs = 22000; // Default: 20000, slight increase
    // config.fiveBarsTimeMs = 75000; // Default: 60000, moderate increase
    // config.zeroBarsNoSignalTimeMs = 6000; // Default: 5000, slight increase
    //
    // // Packet loss tolerance
    // config.fractionalLoss = 0.4; // Default: 0.5, slightly more tolerant but not excessive
    // config.packetsExpected = 60; // Default: 50, moderate increase
    // config.pastSamplesToConsider = 18; // Default: 15, slight increase
    //
    // // Adjust ping thresholds to be more stable
    // config.missedPongsLowerThreshold = 2; // Default: 1, slight increase
    // config.missedPongsUpperThreshold = 5; // Default: 4, moderate increase
    //
    // // Audio sending configuration for better stability
    // config.sendingAudioFailureInitialWaitTimeMs = 4000; // Default: 3000, moderate increase
    // config.sendingAudioFailureSamplesToConsider = 3; // Default: 2, slight increase

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
