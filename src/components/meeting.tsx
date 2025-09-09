"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AudioInputControl,
  AudioOutputControl,
  ContentShareControl,
  ControlBar,
  ControlBarButton,
  MeetingProvider,
  MeetingStatus,
  Phone,
  useAudioVideo,
  useLocalVideo,
  useLogger,
  useMeetingManager,
  useMeetingStatus,
  useRemoteVideoTileState,
  VideoInputControl,
  VideoTileGrid,
} from "amazon-chime-sdk-component-library-react";
import { AudioVideoObserver, EventObserver } from "amazon-chime-sdk-js";
import {
  deleteMeeting,
  type MeetingWithAttendees,
} from "@/lib/actions/meetings";
import type { Attendee } from "@/lib/db/schema";
import type { GetMeetingCommandOutput } from "@aws-sdk/client-chime-sdk-meetings";
import ChimeThemeProvider from "./chime-theme-provider";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  meetingConfigs,
  getMeetingConfigById,
  DEFAULT_MEETING_CONFIG_ID,
} from "@/lib/meetingConfigs";

export type ParticipantType = "host" | "non-host";

interface MeetingSessionProps {
  meeting: MeetingWithAttendees;
  attendee: Attendee;
  participantType: ParticipantType;
  participantId: string;
  chimeMeeting: GetMeetingCommandOutput;
}

// Inner component that handles the meeting logic
function MeetingSessionContent({
  chimeMeeting,
  meeting,
  attendee,
  participantType,
  participantId,
}: MeetingSessionProps) {
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const { isVideoEnabled } = useLocalVideo();
  const { tiles } = useRemoteVideoTileState();
  const [error, setError] = useState<string>("");

  console.log("video-logs", {
    meetingStatus,
  });

  // Get the audio events observer enabled state from sessionStorage
  const [audioEventsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("audioEventsObserverEnabled");
      return stored !== null ? stored === "true" : true; // Default to enabled
    }
    return true;
  });

  useAudioVideoEvents(audioEventsEnabled);
  useMeetingEvents(true);

  // Initialize meeting when component mounts
  useEffect(() => {
    if (meetingManager && meeting && attendee) {
      const initializeMeeting = async () => {
        console.log("🚀 Starting meeting initialization...");
        setError("");

        try {
          // Get selected meeting configuration
          const selectedConfigId =
            typeof window !== "undefined"
              ? sessionStorage.getItem("selectedMeetingConfig") ||
                DEFAULT_MEETING_CONFIG_ID
              : DEFAULT_MEETING_CONFIG_ID;

          const selectedConfig = getMeetingConfigById(selectedConfigId);
          const configToUse =
            selectedConfig || getMeetingConfigById(DEFAULT_MEETING_CONFIG_ID)!;

          console.log(
            `📋 Using meeting configuration: ${configToUse.name} (${configToUse.id})`,
          );

          // Create meeting session configuration using selected config
          const meetingSessionConfiguration = configToUse.config({
            Meeting: chimeMeeting.Meeting!,
            Attendee: {
              AttendeeId: attendee.attendeeId || "",
              JoinToken: attendee.joinToken || "",
              ExternalUserId: attendee.externalUserId || "",
            },
          });

          console.log("⏳ Joining meeting...");
          await meetingManager.join(meetingSessionConfiguration);
          console.log("✅ Successfully joined meeting");

          setTimeout(async () => {
            console.log("▶️ Starting meeting...");
            await meetingManager.start();
            console.log("🎥 Meeting started successfully");

            console.log("🎉 Meeting initialization complete!");
          }, 300);
        } catch (error) {
          console.error("❌ Error initializing meeting:", error);
          setError(
            error instanceof Error ? error.message : "Failed to join meeting",
          );
        }
      };

      initializeMeeting();
    }
  }, [meetingManager, meeting, attendee, chimeMeeting]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Meeting Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (meetingStatus === MeetingStatus.Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold">Joining Meeting</h1>
          <p className="text-muted-foreground">
            Initializing meeting session...
          </p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Joining as: {participantType === "host" ? "Host" : "Participant"}
            </p>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-mono">
                Participant ID: {participantId}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                Chime Attendee ID: {attendee?.attendeeId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-4">
        <div className="mb-4 flex justify-between text-white">
          <div>
            <div className="space-y-1">
              {meetingStatus === MeetingStatus.Succeeded && (
                <div className="space-x-2">
                  <span>
                    <b>Chime Meeting ID</b>: {meeting.meetingId}
                  </span>
                  <span>
                    <b>Remote participants</b>: {tiles.length}
                  </span>
                  <span>
                    <b>Local video</b>: {isVideoEnabled ? "On" : "Off"}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-300">
                <b>{participantType === "host" ? "Host" : "Participant"} : </b>
              </p>
              <div className="space-y-0.5">
                <p className="text-xs text-gray-400 font-mono">
                  Participant ID: {participantId}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Chime Attendee ID: {attendee?.attendeeId}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ToggleAudioEventsObserver />
            <MeetingConfigSelector />
            <div className="text-sm text-green-400">Connected</div>
          </div>
        </div>
        <div
          style={{ padding: "1rem", height: "70vh", boxSizing: "border-box" }}
        >
          <VideoTileGrid />
        </div>
        {meetingStatus === MeetingStatus.Succeeded ? (
          <ControlBar
            layout="undocked-horizontal"
            showLabels
            className="w-[100%]"
          >
            <AudioInputControl />
            <VideoInputControl />
            <AudioOutputControl />
            <ContentShareControl />
            <ControlBarButton
              icon={<span>ID</span>}
              onClick={() => {}}
              label="Copy ID"
            />
            <EndCallButton meeting={meeting} />
          </ControlBar>
        ) : (
          <div>Setting up meeting...</div>
        )}
      </div>
    </div>
  );
}

// Main meeting session component
export function Meeting(props: MeetingSessionProps) {
  return (
    <ChimeThemeProvider>
      <MeetingProvider>
        <MeetingSessionContent {...props} />
      </MeetingProvider>
    </ChimeThemeProvider>
  );
}

function EndCallButton({ meeting }: { meeting: MeetingWithAttendees }) {
  const { endCall, isPending } = useEndCall(meeting.id);

  if (isPending) {
    return <Spinner size="sm" className="mr-2" />;
  }

  return <ControlBarButton icon={<Phone />} onClick={endCall} label="End" />;
}

function useEndCall(meetingId: string) {
  const router = useRouter();
  const meetingManager = useMeetingManager();
  const [isPending, startTransition] = useTransition();

  function endCall() {
    startTransition(async () => {
      await deleteMeeting(meetingId);
      await meetingManager.leave();
      router.push("/");
    });
  }

  return {
    endCall,
    isPending,
  };
}

function useAudioVideoEvents(enabled: boolean = true) {
  const enhancedSelectVideoQuality = useEnhancedSelectVideoQuality();
  const lastBandwidthAdjustment = useRef(0);
  const meetingManager = useMeetingManager();

  useEffect(() => {
    if (!meetingManager.meetingSession || !enabled) return;

    const audioVideoObserver: AudioVideoObserver = {
      connectionDidBecomeGood() {
        console.log("video-logs", "connectionDidBecomeGood");
      },
      connectionDidBecomePoor() {
        console.log("video-logs", "connectionDidBecomePoor");
      },
      connectionDidSuggestStopVideo() {
        console.log("video-logs", "connectionDidSuggestStopVideo");
      },
      audioVideoDidStartConnecting(reconnecting) {
        console.log("video-logs", "audioVideoDidStartConnecting", {
          reconnecting,
        });
      },
      connectionHealthDidChange(connectionHealthData) {
        console.log("video-logs", "connectionHealthDidChange", {
          lastGoodSignalTimestamp:
            connectionHealthData.lastGoodSignalTimestampMs,
          lastNoSignalTimestamp: connectionHealthData.lastNoSignalTimestampMs,
          lastPacketLoss: connectionHealthData.lastPacketLossInboundTimestampMs,
          lastWeakSignal: connectionHealthData.lastWeakSignalTimestampMs,
        });
      },
      metricsDidReceive(clientMetricReport) {
        const now = Date.now();

        const availableOutgoingBitrate =
          clientMetricReport.getObservableMetricValue(
            "availableOutgoingBitrate",
          );
        const availableIncomingBitrate =
          clientMetricReport.getObservableMetricValue(
            "availableIncomingBitrate",
          );
        const audioPacketLossPercent =
          clientMetricReport.getObservableMetricValue(
            "audioPacketLossPercent",
          ) || 0;

        console.log("video-logs", "client metric report", {
          uploadBandwidthKbps: availableOutgoingBitrate / 1000,
          downloadBandwidthKbps: availableIncomingBitrate / 1000,
          audioPacketLossPercent,
        });

        const detectedNetworkQuality = detectNetworkQuality(clientMetricReport);
        // Apply bandwidth adjustment to every 5 seconds
        if (now - lastBandwidthAdjustment.current > 5000) {
          adjustVideoQuality(
            detectedNetworkQuality,
            enhancedSelectVideoQuality,
          );
          lastBandwidthAdjustment.current = now;
        }
      },
    };

    meetingManager.meetingSession.audioVideo.addObserver(audioVideoObserver);

    return () => {
      meetingManager.meetingSession?.audioVideo.removeObserver(
        audioVideoObserver,
      );
    };
  }, [meetingManager.meetingSession, enhancedSelectVideoQuality, enabled]);
}

function useMeetingEvents(enabled: boolean = true) {
  const meetingManager = useMeetingManager();

  const meetingEventsObserver: EventObserver = useMemo(
    () => ({
      eventDidReceive(name, attributes) {
        /**
         * Enhanced event handling for Amazon Chime SDK connection stability
         *
         * DESIGN DECISIONS:
         * 1. Delayed state updates to prevent UI flickering from temporary network issues
         * 2. Enhanced event tracking for monitoring and debugging
         * 3. Graceful handling of connection state transitions
         */
        switch (name) {
          case "receivingAudioDropped": {
            console.log("video-logs: receivingAudioDropped", { attributes });
            break;
          }
          case "signalingDropped":
            console.log("video-logs: signalingDropped", { attributes });
            break;

          case "meetingReconnected":
            console.log("video-logs: meetingReconnected", { attributes });
            break;

          case "sendingAudioFailed":
          case "audioInputFailed":
            console.log("video-logs: Audio input failed", {
              name,
              attributes,
            });
            break;
          case "sendingAudioRecovered":
            console.log("video-logs: sendingAudioRecovered", { attributes });
            break;
          default:
            /**
             * DEFAULT EVENT HANDLING
             *
             * All unhandled events are still tracked for comprehensive monitoring.
             * This ensures we don't miss important events that might need special
             * handling in the future.
             */
            break;
        }

        /**
         * COMPREHENSIVE EVENT TRACKING STRATEGY
         *
         * Every Amazon Chime SDK event is tracked for:
         * 1. Debugging: Helps diagnose issues in production
         * 2. Analytics: Understanding user experience patterns
         * 3. Optimization: Data-driven improvements to connection policies
         * 4. Monitoring: Proactive identification of systemic issues
         *
         * Event data includes:
         * - callId: Links events to specific call sessions
         * - attributes: SDK-provided event metadata
         * - timestamp: When events occurred (added for time-sensitive events)
         *
         * This comprehensive tracking enables:
         * - Root cause analysis of connection issues
         * - Performance monitoring across different network conditions
         * - A/B testing of connection stability improvements
         * - User experience optimization based on real usage data
         */
        console.log(`Meeting event: ${name}`, { attributes });
      },
    }),
    [],
  );

  useEffect(() => {
    if (!meetingManager.meetingSession || !enabled) return;

    meetingManager.meetingSession.eventController.addObserver(
      meetingEventsObserver,
    );

    return () => {
      meetingManager.meetingSession?.eventController.removeObserver(
        meetingEventsObserver,
      );
    };
  }, [meetingManager.meetingSession, enabled, meetingEventsObserver]);
}

export type EnhancedVideoQuality = "180p" | "360p" | "540p" | "720p";

export function useEnhancedSelectVideoQuality(): (
  quality: EnhancedVideoQuality,
) => void {
  const audioVideo = useAudioVideo();
  const logger = useLogger();

  const selectVideoQuality = (quality: EnhancedVideoQuality) => {
    if (!audioVideo) {
      return;
    }

    logger.info(`Enhanced Selecting video quality: ${quality}`);

    switch (quality) {
      case "180p":
        // < 300kbps - Lowest quality (180p)
        audioVideo.chooseVideoInputQuality(320, 180, 15);
        audioVideo.setVideoMaxBandwidthKbps(400);
        break;
      case "360p":
        // 300kbps - 500kbps - Low quality (360p)
        audioVideo.chooseVideoInputQuality(640, 360, 15);
        audioVideo.setVideoMaxBandwidthKbps(600);
        break;
      case "540p":
        // 500kbps - 800kbps - Medium quality (540p)
        audioVideo.chooseVideoInputQuality(960, 540, 15);
        audioVideo.setVideoMaxBandwidthKbps(1000);
        break;
      case "720p":
        // 800kbps - 1.2 Mbps - Keep 720p (no 800kbps tier)
        audioVideo.chooseVideoInputQuality(1280, 720, 15);
        audioVideo.setVideoMaxBandwidthKbps(1200);
        break;
      default:
        logger.warn(`Unsupported video quality: ${quality}`);
    }
  };

  return selectVideoQuality;
}

const VIDEO_RESOLUTION_THRESHOLDS: Record<
  NetworkQualityType,
  EnhancedVideoQuality
> = {
  excellent: "720p", // > 1.2 Mbps - Full quality (720p)
  good: "720p", // 800kbps - 1.2 Mbps - Keep 720p (no 800kbps tier)
  fair: "540p", // 500kbps - 800kbps - Medium quality (540p)
  poor: "360p", // 300kbps - 500kbps - Low quality (360p)
  critical: "180p", // < 300kbps - Lowest quality (180p)
};

type NetworkQualityType = "critical" | "poor" | "fair" | "good" | "excellent";
// TODO:
// - in the ui's main app, we also have detection network quality mechanism but its not that effecient. replace the original detect network quality function with our implementation here in test video playground.
// - we just need to make sure to adjust the function when using it into ui's main app to make it backward-compatible. This is somewhat related to the below item
// - for our UI's main app, for now, we can just use the existing selectVideoQuality that only supports 360p | 540p | 720p. We are still going to use our new detect network quality and adjustVideoQuality
//   that support critical network (180p). What we can do is to unify the poor and critical networks for now so that we can use the Chime selectVideoQuality sdk. Meaning for critical and poor, we
//   are going to use same resolution "360p".
// - (Optional): to make our PR clearer. We need to add a note or statement that this optimization only applies to the sender's outgoing video. While both sender and receiver benefit, the received video optimization for other participants is handled separately.
const detectNetworkQuality = (clientMetricReport: {
  getObservableMetricValue: (metric: string) => number;
}): NetworkQualityType => {
  const availableOutgoingBitrate = clientMetricReport.getObservableMetricValue(
    "availableOutgoingBitrate",
  );
  const audioPacketLossPercent =
    clientMetricReport.getObservableMetricValue("audioPacketLossPercent") || 0;
  const uploadBandwidthKbps = availableOutgoingBitrate / 1000;

  // Implement bandwidth scoring (1-5 scale)
  let bandwidthScore = 0;
  if (uploadBandwidthKbps >= 1200)
    bandwidthScore = 5; // Excellent
  else if (uploadBandwidthKbps >= 800)
    bandwidthScore = 4; // Good
  else if (uploadBandwidthKbps > 500)
    bandwidthScore = 3; // Fair (501-799)
  else if (uploadBandwidthKbps >= 300)
    bandwidthScore = 2; // Poor (300-500 inclusive)
  else bandwidthScore = 1; // Critical (< 300)

  // Calculate packet loss penalty
  let packetLossPenalty = 0;
  if (audioPacketLossPercent > 5)
    packetLossPenalty = 3; // Severe
  else if (audioPacketLossPercent > 3)
    packetLossPenalty = 2; // Moderate
  else if (audioPacketLossPercent > 1) packetLossPenalty = 1; // Minor

  // Combine scores with floor of 1
  const finalScore = Math.max(1, bandwidthScore - packetLossPenalty);

  // Map to quality with bandwidth boundaries
  let quality: NetworkQualityType;
  if (uploadBandwidthKbps < 300) {
    quality = "critical";
  } else if (uploadBandwidthKbps <= 500) {
    quality = finalScore >= 2 ? "poor" : "critical";
  } else {
    // Standard scoring for bandwidth > 500
    if (finalScore >= 5) quality = "excellent";
    else if (finalScore >= 4) quality = "good";
    else if (finalScore >= 3) quality = "fair";
    else if (finalScore >= 2) quality = "poor";
    else quality = "critical";
  }

  // Log scoring components for debugging
  // console.log("video-logs", "Network scoring", {
  //   uploadBandwidthKbps,
  //   audioPacketLossPercent,
  //   bandwidthScore,
  //   packetLossPenalty,
  //   finalScore,
  //   quality,
  // });

  return quality;
};

const adjustVideoQuality = (
  networkQuality: NetworkQualityType,
  selectVideoQuality: ReturnType<typeof useEnhancedSelectVideoQuality>,
) => {
  const targetVideoQuality =
    VIDEO_RESOLUTION_THRESHOLDS[
      networkQuality as keyof typeof VIDEO_RESOLUTION_THRESHOLDS
    ];

  console.log("video-logs", "adjustVideoQuality", {
    targetVideoQuality,
    networkQuality,
  });

  selectVideoQuality(targetVideoQuality);

  return targetVideoQuality;
};

// Toggle Audio Events Observer Component
function ToggleAudioEventsObserver() {
  const [isEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("audioEventsObserverEnabled");
      return stored !== null ? stored === "true" : true; // Default to enabled
    }
    return true;
  });

  const handleToggle = (checked: boolean) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("audioEventsObserverEnabled", checked.toString());
      // Reload the page to apply the new configuration
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="audio-events-observer"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
      />
      <label
        htmlFor="audio-events-observer"
        className="text-xs text-gray-400 whitespace-nowrap cursor-pointer"
      >
        Video Quality Tracker
      </label>
      <span
        className={`text-xs ${isEnabled ? "text-green-400" : "text-gray-500"}`}
      >
        {isEnabled ? "On" : "Off"}
      </span>
    </div>
  );
}

// Meeting Configuration Selector Component
function MeetingConfigSelector() {
  const [selectedConfig] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("selectedMeetingConfig") ||
        DEFAULT_MEETING_CONFIG_ID
      );
    }
    return DEFAULT_MEETING_CONFIG_ID;
  });

  const handleConfigChange = (configId: string) => {
    if (typeof window !== "undefined") {
      // Store the selected config ID in sessionStorage
      sessionStorage.setItem("selectedMeetingConfig", configId);
      // Reload the page to apply the new configuration
      window.location.reload();
    }
  };

  const currentConfig = getMeetingConfigById(selectedConfig);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 whitespace-nowrap">
        Meeting config:
      </span>
      <Select value={selectedConfig} onValueChange={handleConfigChange}>
        <SelectTrigger className="w-[180px] h-8 bg-gray-800 border-gray-600 text-white text-xs">
          <SelectValue placeholder="Select configuration">
            {currentConfig?.name || "Select configuration"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {meetingConfigs.map((config) => (
            <SelectItem
              key={config.id}
              value={config.id}
              className="text-white hover:bg-gray-700 text-xs"
            >
              <div className="flex flex-col">
                <span className="font-medium">{config.name}</span>
                <span className="text-gray-400 text-xs">
                  {config.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
