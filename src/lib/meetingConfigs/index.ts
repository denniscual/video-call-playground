import { config as cpConfig } from "./cp";
import { config as defaultConfig } from "./default";
import { config as customConfig } from "./custom";
import type { MeetingConfig } from "./types";

export const meetingConfigs: MeetingConfig[] = [
  {
    id: "meeting-config-default",
    name: "Default",
    description: "Default config (AWS Chime)",
    config: defaultConfig,
  },
  {
    id: "meeting-config-cp",
    name: "CP",
    description: "Config used by CP",
    config: cpConfig,
  },
  {
    id: "meeting-config-custom",
    name: "Custom",
    description: "Custom config with overridable connection health settings",
    config: customConfig,
  },
];

export function getMeetingConfigById(id: string): MeetingConfig | undefined {
  return meetingConfigs.find((config) => config.id === id);
}

export const DEFAULT_MEETING_CONFIG_ID = "meeting-config-default";

export * from "./types";
