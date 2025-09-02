# Test Different Meeting Session Configurations Feature

## Research

### Problem

- Currently, when updating meeting configurations (e.g., improving video quality, adjusting audio settings, modifying bandwidth limits) and testing in production, it's difficult to confirm if the changes actually improve the user experience because we don't have access to the previous meeting config for comparison. This makes A/B testing impossible.
- A/B testing allows us to compare different configuration versions and make data-driven assessments about which version performs best based on specific metrics (video quality, connection stability, user satisfaction).
- The current version of the app doesn't provide a way to compare different configuration versions (previous vs next build) within the same session or environment.

### Solution

- Add a configuration selector widget in the meeting component that allows administrators to choose between different meeting configurations in real-time.
- When a configuration is selected, the meeting will be updated to use the new settings, allowing for immediate comparison and testing.

## Plan

- Enable administrators to perform A/B testing for different meeting session configurations by providing a UI selector widget.
- Add this functionality to the Meeting component (`src/components/meeting.tsx`) where users are already in an active session.
- Create a meeting configurations directory in `src/lib/meetingConfigs/` to house different configuration presets.
- Implement configuration switching + a full page reload for better user experience.

## Implementation

- add a select widget in the active meeting. meeting is rendered by join call page (e.g url http://localhost:3000/join-call/957bedbc-8d09-42f7-823b-5d43c93b714d)
- use Select Component from shadcn ui. docs: https://ui.shadcn.com/docs/components/select
- define a meeting config directory in the @../../src/lib which house the meeting configurations.

  - put all configs inside the index.ts file.
  - this file returns an array of meeting config.
  - meeting config is an object which has a id, name, and the meeting configuration. This meeting configuration is a function that returns an instance of MeetingSessionConfiguration.

  ```typescript
  // lib/meetingConfigs/index.ts
  const meetingConfig1 = {
      id: 'meeting-config-1',
      name: 'Meeting Config 1' // we can use this as the select label
      config // this points to an imported module for this config.
  }

  // lib/meetingConfigs/config-1.ts
  export function config(args) {
  				const meetingSessionConfiguration = new MeetingSessionConfiguration(
  					args
  				);
                    // udpate config here
                    return meetingSessionConfiguration
  }
  ```

- the changes here are most frontend (don't update the backend)

### Flow of the feature

- admin join a call, he/she will be redirected to meeting page
- in the meeting page, there is a select ui for meeting configs.
- user can select a config.
- after selecting, the app gets reloaded with the chose meeting configuration.
