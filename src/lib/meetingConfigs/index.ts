import { config as cpConfig } from "./cp";
import { config as defaultConfig } from "./default";
import type { MeetingConfig } from "./types";

export const meetingConfigs: MeetingConfig[] = [
  {
    id: "meeting-config-custom",
    name: "Custom",
    description: "Default config (AWS Chime)",
    config: defaultConfig,
  },
  {
    id: "meeting-config-cp",
    name: "CP",
    description: "Config used by CP",
    config: cpConfig,
  },
];

export function getMeetingConfigById(id: string): MeetingConfig | undefined {
  return meetingConfigs.find((config) => config.id === id);
}

export const DEFAULT_MEETING_CONFIG_ID = "meeting-config-custom";

export * from "./types";
