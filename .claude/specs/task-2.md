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

### Phase 2

#### Unify the chime meeting and meeting action

- Currently, we do have separate actions to create meetings- meeting action that interacts with the supabase db using drizzle
  and then meeting that interacts with the SDK
- The database will hold the information of all the created meetings. In this way, we can manage
  all meetings in application level as chime sdk only provide create meeting and delete meeting.

_Flows_:

1. host creates a meeting.
2. the backend creates this meeting using the chime sdk.
3. information from the chime sdk create meeting will be stored in the database including the meeting data like the url, ids, and attendees.
4. participant can join the meeting using the url with meeting id.
5. E.g url `/join-call/${meetingId}`, participant gets the meeting id from the url.
6. in participant, it will call the action that retrieves the meeting id from the database (not from the chime sdk).
7. it tries to validate if the meeting id exist.
8. if exist, then join and start the call. Else, show an error page.

The beauty of having database because we can list all of the created meetings, define an action to get a meeting based on the id, etc. Something like CRUD.

Tasks:

- unify the 2 actions.
- update the db schema to match what we need. We can skip the creation of attendees but we need participants table.
- participants is a new table with below fields:
  - type: 'host' | 'non-host' (required)
  - name: string (optional)
- update the meetings table. we can omit the meetingUrl and also the title. Instead includes fields from the chime
  meeting and attendees response.

  - replace the meetings table into this schema:

  ```tyepscript
  // Meeting response: response = await client.send(createMeetingCommand)
  interface Meeting {
    /**
     * <p>The Amazon Chime SDK meeting ID.</p>
     * @public
     */
    MeetingId: string
    /**
     * <p>Reserved.</p>
     * @public
     */
    MeetingHostId?: string | undefined;
    /**
     * <p>The external meeting ID.</p>
     *          <p>Pattern: <code>[-_&@+=,()\{\}\[\]\/«».:|'"#a-zA-Z0-9À-ÿ\s]*</code>
     *          </p>
     *          <p>Values that begin with <code>aws:</code> are reserved. You can't configure a value that uses this prefix.
     *             Case insensitive.</p>
     * @public
     */
    ExternalMeetingId: string
    /**
     * <p>The Region in which you create the meeting. Available values: <code>af-south-1</code>, <code>ap-northeast-1</code>,
     *             <code>ap-northeast-2</code>, <code>ap-south-1</code>, <code>ap-southeast-1</code>, <code>ap-southeast-2</code>, <code>ca-central-1</code>,
     *             <code>eu-central-1</code>, <code>eu-north-1</code>, <code>eu-south-1</code>,
     *             <code>eu-west-1</code>, <code>eu-west-2</code>, <code>eu-west-3</code>,
     *             <code>sa-east-1</code>, <code>us-east-1</code>, <code>us-east-2</code>,
     *             <code>us-west-1</code>, <code>us-west-2</code>.</p>
     *          <p>Available values in Amazon Web Services GovCloud (US) Regions: <code>us-gov-east-1</code>, <code>us-gov-west-1</code>.</p>
     * @public
     */
    MediaRegion?: string | undefined;
    /**
     * <p>The features available to a meeting, such as echo reduction.</p>
     * @public
     */
    /**
     * <p>When specified, replicates the media from the primary meeting to this meeting.</p>
     * @public
     */
    PrimaryMeetingId?: string | undefined;
  }
  ```

  - create new table Attendees schema

  ```
  // response = await client.send(createAttendeeCommand)
  interface Attendee {
    MeetingId: string,  // this is the meeting id
    /**
     * <p>The Amazon Chime SDK external user ID. An idempotency token. Links the attendee to an identity managed by a builder application.</p>
     *          <p>Pattern: <code>[-_&@+=,()\{\}\[\]\/«».:|'"#a-zA-Z0-9À-ÿ\s]*</code>
     *          </p>
     *          <p>Values that begin with <code>aws:</code> are reserved. You can't configure a value that uses this prefix.
     *             Case insensitive.</p>
     * @public
     */
    ExternalUserId?: string | undefined; // this is the participant id
    /**
     * <p>The Amazon Chime SDK attendee ID.</p>
     * @public
     */
    AttendeeId?: string | undefined; // chime attendee id.
    /**
     * <p>The join token used by the Amazon Chime SDK attendee.</p>
     * @public
     */
    JoinToken?: string | undefined;
    /**
     * <p>The capabilities assigned to an attendee: audio, video, or content.</p>
     *          <note>
     *             <p>You use the capabilities with a set of values that control what the capabilities can do, such as <code>SendReceive</code> data. For more information about those values, see
     *             .</p>
     *          </note>
     *          <p>When using capabilities, be aware of these corner cases:</p>
     *          <ul>
     *             <li>
     *                <p>If you specify <code>MeetingFeatures:Video:MaxResolution:None</code> when you create a meeting, all API requests
     *                     that include <code>SendReceive</code>, <code>Send</code>, or <code>Receive</code> for <code>AttendeeCapabilities:Video</code> will be rejected with <code>ValidationError 400</code>.</p>
     *             </li>
     *             <li>
     *                <p>If you specify <code>MeetingFeatures:Content:MaxResolution:None</code> when you create a meeting, all API requests that include <code>SendReceive</code>, <code>Send</code>, or
     *                     <code>Receive</code> for <code>AttendeeCapabilities:Content</code> will be rejected with <code>ValidationError 400</code>.</p>
     *             </li>
     *             <li>
     *                <p>You can't set <code>content</code> capabilities to <code>SendReceive</code> or <code>Receive</code> unless you also set <code>video</code> capabilities to <code>SendReceive</code>
     *                     or <code>Receive</code>. If you don't set the <code>video</code> capability to receive, the response will contain an HTTP 400 Bad Request status code. However, you can set your <code>video</code> capability
     *                     to receive and you set your <code>content</code> capability to not receive.</p>
     *             </li>
     *             <li>
     *                <p>When you change an <code>audio</code> capability from <code>None</code> or <code>Receive</code> to <code>Send</code> or <code>SendReceive</code> ,
     *                     and if the attendee left their microphone unmuted, audio will flow from the attendee to the other meeting participants.</p>
     *             </li>
     *             <li>
     *                <p>When you change a <code>video</code> or <code>content</code> capability from <code>None</code> or <code>Receive</code> to <code>Send</code> or <code>SendReceive</code> ,
     *                     and if the attendee turned on their video or content streams, remote attendees can receive those streams, but only after media renegotiation between the client and the Amazon Chime back-end server.</p>
     *             </li>
     *          </ul>
     * @public
     */
  }/ Attendees response: response = await client.send(createMeetingCommand)

  ```

  - create new participants table

  ```typescript

  interface Participant {
      id: string,
      type: 'host' | 'non-host' (required)
      name: string (optional) // name of the participant
  }
  ```

#### UI: Update the specific meeting page

- update the meeting page to show the new information- meeting and the attendees.
- make sure to show the meeting information and the attendees. just show the relavant information.
