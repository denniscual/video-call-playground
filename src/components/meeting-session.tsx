"use client";

import React, { useEffect, useState } from "react";
import {
  AudioInputControl,
  AudioOutputControl,
  ContentShareControl,
  ControlBar,
  ControlBarButton,
  MeetingProvider,
  MeetingStatus,
  Phone,
  useLocalVideo,
  useMeetingManager,
  useMeetingStatus,
  useRemoteVideoTileState,
  VideoInputControl,
  VideoTileGrid,
} from "amazon-chime-sdk-component-library-react";
import {
  MeetingSessionConfiguration,
  VideoInputDevice,
} from "amazon-chime-sdk-js";
import type { MeetingWithAttendees } from "@/lib/actions/meetings";
import type { Attendee } from "@/lib/db/schema";
import type { GetMeetingCommandOutput } from "@aws-sdk/client-chime-sdk-meetings";
import ChimeThemeProvider from "./chime-theme-provider";

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

  // Initialize meeting when component mounts
  useEffect(() => {
    if (meetingManager && meeting && attendee) {
      initializeMeeting();
    }
  }, [meetingManager, meeting, attendee]);

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
            <ControlBarButton icon={<Phone />} onClick={() => {}} label="End" />
          </ControlBar>
        ) : (
          <div>Setting up meeting...</div>
        )}
      </div>
    </div>
  );
}

// Main meeting session component
export function MeetingSession(props: MeetingSessionProps) {
  return (
    <ChimeThemeProvider>
      <MeetingProvider>
        <MeetingSessionContent {...props} />
      </MeetingProvider>
    </ChimeThemeProvider>
  );
}
