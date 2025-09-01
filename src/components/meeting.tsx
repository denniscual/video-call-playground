"use client";

import React, {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
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
import {
  AudioVideoObserver,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import {
  deleteMeeting,
  type MeetingWithAttendees,
} from "@/lib/actions/meetings";
import type { Attendee } from "@/lib/db/schema";
import type { GetMeetingCommandOutput } from "@aws-sdk/client-chime-sdk-meetings";
import ChimeThemeProvider from "./chime-theme-provider";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

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

  useAudioVideoEvents();

  // Initialize meeting when component mounts
  useEffect(() => {
    if (meetingManager && meeting && attendee) {
      const initializeMeeting = async () => {
        console.log("🚀 Starting meeting initialization...");
        setError("");

        try {
          // Create meeting session configuration
          const meetingSessionConfiguration = new MeetingSessionConfiguration(
            {
              Meeting: chimeMeeting.Meeting!,
            },
            {
              AttendeeId: attendee.attendeeId || "",
              JoinToken: attendee.joinToken || "",
              ExternalUserId: attendee.externalUserId || "",
            },
          );

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
          <div className="text-sm text-green-400">Connected</div>
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
  const { action, isPending } = useEndCallAction(meeting.id);

  if (isPending) {
    return <Spinner size="sm" className="mr-2" />;
  }

  return <ControlBarButton icon={<Phone />} onClick={action} label="End" />;
}

function useEndCallAction(meetingId: string) {
  const router = useRouter();
  const meetingManager = useMeetingManager();
  const [, deleteMeetingAction, isPending] = useActionState(async () => {
    await deleteMeeting(meetingId);
    await meetingManager.leave();
    router.push("/");
  }, null);

  return {
    action: deleteMeetingAction,
    isPending,
  };
}

function useAudioVideoEvents() {
  const enhancedSelectVideoQuality = useEnhancedSelectVideoQuality();
  const lastBandwidthAdjustment = useRef(0);
  const meetingManager = useMeetingManager();

  useEffect(() => {
    if (!meetingManager.meetingSession) return;

    const audioVideoObserver: AudioVideoObserver = {
      metricsDidReceive(clientMetricReport) {
        const now = Date.now();

        const detectedNetworkQuality = detectNetworkQuality(clientMetricReport);
        // Apply bandwidth adjustment to every 10 seconds
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
  }, [meetingManager.meetingSession, enhancedSelectVideoQuality]);
}

export type EnhancedVideoQuality = "180p" | "360p" | "540p" | "720p";

export function useEnhancedSelectVideoQuality(): (
  quality: EnhancedVideoQuality,
) => void {
  const audioVideo = useAudioVideo();
  const logger = useLogger();

  const selectVideoQuality = useCallback(
    (quality: EnhancedVideoQuality) => {
      if (!audioVideo) {
        return;
      }

      logger.info(`Enhanced Selecting video quality: ${quality}`);

      switch (quality) {
        case "180p":
          // < 300kbps - Lowest quality (180p)
          audioVideo.chooseVideoInputQuality(320, 180, 15);
          audioVideo.setVideoMaxBandwidthKbps(300);
          break;
        case "360p":
          // 300kbps - 500kbps - Low quality (360p)
          audioVideo.chooseVideoInputQuality(640, 360, 15);
          audioVideo.setVideoMaxBandwidthKbps(500);
          break;
        case "540p":
          // 500kbps - 800kbps - Medium quality (540p)
          audioVideo.chooseVideoInputQuality(960, 540, 15);
          audioVideo.setVideoMaxBandwidthKbps(800);
          break;
        case "720p":
          // 800kbps - 1.2 Mbps - Keep 720p (no 800kbps tier)
          audioVideo.chooseVideoInputQuality(1280, 720, 15);
          audioVideo.setVideoMaxBandwidthKbps(1200);
          break;
        default:
          logger.warn(`Unsupported video quality: ${quality}`);
      }
    },
    [audioVideo, logger],
  );

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
const detectNetworkQuality = (clientMetricReport: {
  getObservableMetricValue: (metric: string) => number;
}): NetworkQualityType => {
  const availableOutgoingBitrate = clientMetricReport.getObservableMetricValue(
    "availableOutgoingBitrate",
  );
  const audioPacketLossPercent = clientMetricReport.getObservableMetricValue(
    "audioPacketLossPercent",
  );
  const uploadBandwidthKbps = availableOutgoingBitrate / 1000;

  if (
    uploadBandwidthKbps < 300 ||
    (!isNaN(audioPacketLossPercent) && audioPacketLossPercent > 5)
  )
    return "critical";
  if (
    uploadBandwidthKbps < 500 ||
    (!isNaN(audioPacketLossPercent) && audioPacketLossPercent > 3)
  )
    return "poor";
  if (
    uploadBandwidthKbps < 800 ||
    (!isNaN(audioPacketLossPercent) && audioPacketLossPercent > 2)
  )
    return "fair";
  if (
    uploadBandwidthKbps < 1200 ||
    (!isNaN(audioPacketLossPercent) && audioPacketLossPercent > 1)
  )
    return "good";
  return "excellent";
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
