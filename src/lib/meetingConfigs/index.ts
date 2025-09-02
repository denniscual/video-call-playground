import { config1 } from './config-1';
import { config2 } from './config-2';
import { config3 } from './config-3';
import type { MeetingConfig } from './types';

export const meetingConfigs: MeetingConfig[] = [
  {
    id: 'meeting-config-1',
    name: 'Standard Quality',
    description: 'Default video quality settings for balanced performance',
    config: config1
  },
  {
    id: 'meeting-config-2', 
    name: 'High Quality',
    description: 'Enhanced video quality for high bandwidth connections',
    config: config2
  },
  {
    id: 'meeting-config-3',
    name: 'Low Bandwidth',
    description: 'Optimized settings for poor network conditions',
    config: config3
  }
];

export function getMeetingConfigById(id: string): MeetingConfig | undefined {
  return meetingConfigs.find(config => config.id === id);
}

export const DEFAULT_MEETING_CONFIG_ID = 'meeting-config-1';

export * from './types';