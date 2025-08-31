# Create and Join Meeting in Client

## Plan

- we already have meeting actions for creating meeting and get meeting by id (id key from drizzle meetings table)
- we are going to create a route `join-call/${meetingId}` to initiate and join a call meeting session.
- both host and non-host can join the meeting based on the meetingId.
- for now, the only participants that can join the meeting are:
  ```typescript
  const hardcodedParticipants = {
    host: {
      id: "763e07ad-2d49-4dab-8d5f-fb0b505da275",
    },
    nonHost: {
      id: "76e6aaa3-1dbe-451c-b8e6-6cb87366d0fe",
    },
  };
  ```
- the host is the one that creates the meeting.
- both host and non-host are attendees. host is just the one that can create the meeting.
- the `hardcodedParticipants` are the only that can create and join the meeting.
- in the meeting, both participants can send audio and video strem. content share will not be supported for now.

## Implementation

- define page `join-call/${meetingId`}`
- this is where the meeting will be active
- for toggling mic and video, for now, it will alwasy be active for both users (host and non-host)
- render the video in VideoTileGrid
- one implemented, always run the typechecking.
- check the ../../samples/meeting to have idea on how to instantiate meeting in the client.

## References

- https://aws.github.io/amazon-chime-sdk-js/classes/meetingsessionconfiguration.html
- sample ../../samples/meeting
- useMeetingManager hook doc https://aws.github.io/amazon-chime-sdk-component-library-react/?path=/docs/sdk-providers-meetingmanager--page
