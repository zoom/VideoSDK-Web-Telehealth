import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateVideoSdkApiJwt } from "~/utils/signJwt";

export const zoomRouter = createTRPCRouter({
  getSessionRecordings: protectedProcedure.input(z.object({ sessionName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const getSessions = await fetch(`https://api.zoom.us/v2/videosdk/sessions?type=past`, {
        headers: {
          'Authorization': `Bearer ${generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET)}`
        }
      })
      if (getSessions.status !== 200) {
        return null;
      }
      const sessions = await getSessions.json() as typeof ExampleSessionJSON;
      let sessionId: string | null = null;
      for (const session of sessions.sessions) {
        if (session.session_name === input.sessionName) {
          sessionId = session.id;
          break;
        }
      }
      const getRecording = await fetch(`https://api.zoom.us/v2/videosdk/sessions/${sessionId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET)}`
        }
      })
      if (getRecording.status === 200) {
        const data = await getRecording.json() as typeof ExampleRecordingJSON;
        return data;
      } else {
        return null;
      }
    }),
});

// for typescript
const ExampleSessionJSON = {
  "from": "2021-12-01",
  "to": "2021-12-02",
  "page_size": 30,
  "next_page_token": "suQA5LvDBnH5No5OYD7mqpJuFzJqUOHK8U2",
  "sessions": [
    {
      "id": "sfk/aOFJSJSYhGwk1hnxgw==",
      "session_name": "My session",
      "start_time": "2019-08-20T19:09:01Z",
      "end_time": "2019-08-20T19:19:01Z",
      "duration": "30:00",
      "user_count": 2,
      "has_voip": true,
      "has_video": true,
      "has_screen_share": true,
      "has_recording": true,
      "has_pstn": true,
      "session_key": "my_session_key"
    }
  ]
};

const ExampleRecordingJSON = {
  "timezone": "",
  "duration": 1,
  "session_id": "kwPoX6bTS4uWBYwmEpzBvA==",
  "session_name": "testSDK124",
  "start_time": "2022-02-01T19:12:01Z",
  "total_size": 5686716,
  "recording_count": 3,
  "recording_files": [
    {
      "id": "f0b0b02a-24e6-4b57-xx67-b14c03ba42c7",
      "status": "completed",
      "recording_start": "2022-02-01T19:13:02Z",
      "recording_end": "2022-02-01T19:14:12Z",
      "file_type": "MP4",
      "file_size": 3477124,
      "download_url": "https://web.example.com/rec/download/gYV4085ivAhN0sSASa0L4KNu6lGnFvsahfIKFxIuKE5UeLrVit16OJ2tCBLSCSQLnA5dWlJ1jknPVJVu.sf0cPIDusWDMqTbO",
      "recording_type": "shared_screen_with_speaker_view",
      "file_extension": "MP4"
    },
    {
      "id": "b5487b74-17a2-440e-93e7-d009db00c3cf",
      "status": "completed",
      "recording_start": "2022-02-01T19:13:02Z",
      "recording_end": "2022-02-01T19:14:12Z",
      "file_type": "M4A",
      "file_size": 1104796,
      "download_url": "https://web.example.com/rec/download/1fmg5SxfSW7UuA4cQT6282isttmNTddairEwq7uMZEJqDs7rFB-rSpQS2kBnT2zBqH5-mM3Q6nZBfQyY.djXshU4mG85q_bZ7",
      "recording_type": "audio_only",
      "file_extension": "M4A"
    }
  ],
  "participant_audio_files": [
    {
      "id": "30306814-b919-41e7-9iit-e20ed2c7ab21",
      "status": "completed",
      "recording_start": "2022-02-01T19:13:02Z",
      "recording_end": "2022-02-01T19:14:12Z",
      "file_type": "M4A",
      "file_size": 1104796,
      "download_url": "https://web.example.com/rec/download/5JNOuxxPKaYQqKmk5ZegBlUlJq6_TVapkAPlTY9uoiFWU2Xy9Ssh04_bJuT9lMrVQRVPm6nG-wX7na9a.C7pS655JRCXRE9l4",
      "file_name": "Audio only - Example53",
      "file_extension": "M4A"
    }
  ]
}