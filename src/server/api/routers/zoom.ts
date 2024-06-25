import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateVideoSdkApiJwt } from "~/utils/signJwt";

export const zoomRouter = createTRPCRouter({
  getLatestRecording: protectedProcedure.input(z.object({ roomId: z.string() })).mutation(async ({ ctx, input }) => {
    const room = await ctx.db.room.findUnique({
      where: { id: input.roomId },
    });
    if (room) {
      const sessionId = room.zoomSessionsIds[room.zoomSessionsIds.length - 1];
      const getRecording = await fetch(`https://api.zoom.us/v2/videosdk/sessions/${sessionId}/recordings`, {
        headers: {
          Authorization: `Bearer ${generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET)}`,
        },
      });
      if (getRecording.status === 3301) {
        return { status: "processing", data: null };
      } else if (getRecording.status === 200) {
        const data = (await getRecording.json()) as typeof ExampleRecordingJSON;
        return { status: "completed", data: data };
      } else if (getRecording.status === 404) {
        return { status: "not_found", data: null };
      } else {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error fetching recording" });
      }
    }
    throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
  }),
  fetchAllRecordings: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    // might get rate-limited?
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });
      if (room) {
        const recordings = await Promise.all(
          room.zoomSessionsIds.map(async (sessionId) => {
            const getRecording = await fetch(`https://api.zoom.us/v2/videosdk/sessions/${sessionId}/recordings`, {
              headers: {
                Authorization: `Bearer ${generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET)}`,
              },
            });
            if (getRecording.status === 3301) {
              return { status: "processing", data: null } as const;
            } else if (getRecording.status === 200) {
              const data = (await getRecording.json()) as typeof ExampleRecordingJSON;
              return { status: "completed", data: data } as const;
            } else if (getRecording.status === 404) {
              return { status: "not_found", data: null } as const;
            } else {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error fetching recording" });
            }
          })
        );
        const completed = getCompletedRecordings(recordings.filter((e) => e.status === "completed" && e.data !== null).map((e) => e.data));
        return completed;
      }
      throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
    }),
  getAllRecordings: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });
      if (room) {
        const recordings = await Promise.all(
          room.zoomSessionsIds.map(async (sessionId) => {
            const getRecording = await fetch(`https://api.zoom.us/v2/videosdk/sessions/${sessionId}/recordings`, {
              headers: {
                Authorization: `Bearer ${generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET)}`,
              },
            });
            if (getRecording.status === 3301) {
              return { status: "processing", data: null } as const;
            } else if (getRecording.status === 200) {
              const data = (await getRecording.json()) as typeof ExampleRecordingJSON;
              return { status: "completed", data: data } as const;
            } else if (getRecording.status === 404) {
              return { status: "not_found", data: null } as const;
            } else {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error fetching recording" });
            }
          })
        );
        const completed = getCompletedRecordings(recordings.filter((e) => e.status === "completed" && e.data !== null).map((e) => e.data));
        return completed;
      }
      throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
    }),
});

// type hack for non null
const getCompletedRecordings = (recordings: (typeof ExampleRecordingJSON | null)[]) => {
  return recordings as (typeof ExampleRecordingJSON)[];
};

// for typescript
const ExampleRecordingJSON = {
  timezone: "",
  duration: 1,
  session_id: "kwPoX6bTS4uWBYwmEpzBvA==",
  session_name: "testSDK124",
  start_time: "2022-02-01T19:12:01Z",
  total_size: 5686716,
  recording_count: 3,
  recording_files: [
    {
      id: "f0b0b02a-24e6-4b57-xx67-b14c03ba42c7",
      status: "completed",
      recording_start: "2022-02-01T19:13:02Z",
      recording_end: "2022-02-01T19:14:12Z",
      file_type: "MP4",
      file_size: 3477124,
      download_url: "https://web.example.com/rec/download/gYV4085ivAhN0sSASa0L4KNu6lGnFvsahfIKFxIuKE5UeLrVit16OJ2tCBLSCSQLnA5dWlJ1jknPVJVu.sf0cPIDusWDMqTbO",
      recording_type: "shared_screen_with_speaker_view",
      file_extension: "MP4",
    },
    {
      id: "b5487b74-17a2-440e-93e7-d009db00c3cf",
      status: "completed",
      recording_start: "2022-02-01T19:13:02Z",
      recording_end: "2022-02-01T19:14:12Z",
      file_type: "M4A",
      file_size: 1104796,
      download_url: "https://web.example.com/rec/download/1fmg5SxfSW7UuA4cQT6282isttmNTddairEwq7uMZEJqDs7rFB-rSpQS2kBnT2zBqH5-mM3Q6nZBfQyY.djXshU4mG85q_bZ7",
      recording_type: "audio_only",
      file_extension: "M4A",
    },
  ],
  participant_audio_files: [
    {
      id: "30306814-b919-41e7-9iit-e20ed2c7ab21",
      status: "completed",
      recording_start: "2022-02-01T19:13:02Z",
      recording_end: "2022-02-01T19:14:12Z",
      file_type: "M4A",
      file_size: 1104796,
      download_url: "https://web.example.com/rec/download/5JNOuxxPKaYQqKmk5ZegBlUlJq6_TVapkAPlTY9uoiFWU2Xy9Ssh04_bJuT9lMrVQRVPm6nG-wX7na9a.C7pS655JRCXRE9l4",
      file_name: "Audio only - Example53",
      file_extension: "M4A",
    },
  ],
};
