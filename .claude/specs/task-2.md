# Task Specification: Add Initial Requirements for Meeting

## Plan

### Phase 1

- to add create meeting action.
- once a meeting created through the server action, create one attendee.
- in the home page, just create a button that creates this meeting. no need UI form. we are going to fill the sample data in the server action. we only use this button to trigger the request.

## Setup:

- use @aws-sdk/client-chime-sdk-meetings for chime sdk.
- use uuid for the creation of RFC9562 (formerly RFC4122) UUIDs

## Implementation

### Phase 1

#### Chime sdk meeting instance

- before creating meeting, we need to configure the chime sdk. the returned value is the sdk meetings client. make sure to use this client across the codes that access the chime sdk.

```typescript
import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
const client = new ChimeSDKMeetings({
  region, // The AWS region to which this client will send requests
  credentials: {
    // The credentials used to sign requests.
    accessKeyId,
    secretAccessKey,
  },
});
```

For the configuration, store this variables in environment var files.

- NEXT_PUBLIC_AWS_CHIME_REGION: ap-southeast-1 (public)
- AWS_CHIME_ACCESS_KEY: \*\*\*
- AWS_CHIME_SECRET_KEY: \*\*\*

#### Creating Meeting

- For creating meeting, below is the api:

```typescript
import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings"; // ES Modules import
// const { ChimeSDKMeetingsClient, CreateMeetingCommand } = require("@aws-sdk/client-chime-sdk-meetings"); // CommonJS import
const client = new ChimeSDKMeetingsClient(config);
const input = {
  // CreateMeetingRequest
  ClientRequestToken: "STRING_VALUE", // required
  MediaRegion: "STRING_VALUE", // required
  MeetingHostId: "STRING_VALUE",
  ExternalMeetingId: "STRING_VALUE", // required
  NotificationsConfiguration: {
    // NotificationsConfiguration
    LambdaFunctionArn: "STRING_VALUE",
    SnsTopicArn: "STRING_VALUE",
    SqsQueueArn: "STRING_VALUE",
  },
  MeetingFeatures: {
    // MeetingFeaturesConfiguration
    Audio: {
      // AudioFeatures
      EchoReduction: "AVAILABLE" || "UNAVAILABLE",
    },
    Video: {
      // VideoFeatures
      MaxResolution: "None" || "HD" || "FHD",
    },
    Content: {
      // ContentFeatures
      MaxResolution: "None" || "FHD" || "UHD",
    },
    Attendee: {
      // AttendeeFeatures
      MaxCount: Number("int"),
    },
  },
  PrimaryMeetingId: "STRING_VALUE",
  TenantIds: [
    // TenantIdList
    "STRING_VALUE",
  ],
  Tags: [
    // TagList
    {
      // Tag
      Key: "STRING_VALUE", // required
      Value: "STRING_VALUE", // required
    },
  ],
};
const command = new CreateMeetingCommand(input);
const response = await client.send(command);
// { // CreateMeetingResponse
//   Meeting: { // Meeting
//     MeetingId: "STRING_VALUE",
//     MeetingHostId: "STRING_VALUE",
//     ExternalMeetingId: "STRING_VALUE",
//     MediaRegion: "STRING_VALUE",
//     MediaPlacement: { // MediaPlacement
//       AudioHostUrl: "STRING_VALUE",
//       AudioFallbackUrl: "STRING_VALUE",
//       SignalingUrl: "STRING_VALUE",
//       TurnControlUrl: "STRING_VALUE",
//       ScreenDataUrl: "STRING_VALUE",
//       ScreenViewingUrl: "STRING_VALUE",
//       ScreenSharingUrl: "STRING_VALUE",
//       EventIngestionUrl: "STRING_VALUE",
//     },
//     MeetingFeatures: { // MeetingFeaturesConfiguration
//       Audio: { // AudioFeatures
//         EchoReduction: "AVAILABLE" || "UNAVAILABLE",
//       },
//       Video: { // VideoFeatures
//         MaxResolution: "None" || "HD" || "FHD",
//       },
//       Content: { // ContentFeatures
//         MaxResolution: "None" || "FHD" || "UHD",
//       },
//       Attendee: { // AttendeeFeatures
//         MaxCount: Number("int"),
//       },
//     },
//     PrimaryMeetingId: "STRING_VALUE",
//     TenantIds: [ // TenantIdList
//       "STRING_VALUE",
//     ],
//     MeetingArn: "STRING_VALUE",
//   },
// };
```

#### Creating Attendees

- for creating attendee, below is the api:

```typescript
import {
  ChimeSDKMeetingsClient,
  CreateAttendeeCommand,
} from "@aws-sdk/client-chime-sdk-meetings"; // ES Modules import
// const { ChimeSDKMeetingsClient, CreateAttendeeCommand } = require("@aws-sdk/client-chime-sdk-meetings"); // CommonJS import
const client = new ChimeSDKMeetingsClient(config);
const input = {
  // CreateAttendeeRequest
  MeetingId: "STRING_VALUE", // required
  ExternalUserId: "STRING_VALUE", // required
  Capabilities: {
    // AttendeeCapabilities
    Audio: "SendReceive" || "Send" || "Receive" || "None", // required
    Video: "SendReceive" || "Send" || "Receive" || "None", // required
    Content: "SendReceive" || "Send" || "Receive" || "None", // required
  },
};
const command = new CreateAttendeeCommand(input);
const response = await client.send(command);
// { // CreateAttendeeResponse
//   Attendee: { // Attendee
//     ExternalUserId: "STRING_VALUE",
//     AttendeeId: "STRING_VALUE",
//     JoinToken: "STRING_VALUE",
//     Capabilities: { // AttendeeCapabilities
//       Audio: "SendReceive" || "Send" || "Receive" || "None", // required
//       Video: "SendReceive" || "Send" || "Receive" || "None", // required
//       Content: "SendReceive" || "Send" || "Receive" || "None", // required
//     },
//   },
// };
```

#### References

- server in the sample meeting: ../../samples/meeting/server.js
