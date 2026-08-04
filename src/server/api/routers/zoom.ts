import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rooms } from "~/server/db/schema";
import { generateVideoSdkApiJwt } from "~/utils/signJwt";

type RecordingLookup =
  | { status: "completed"; data: ZoomRecording }
  | { status: "not_found"; data: null };

const fetchRecording = async (
  sessionId: string,
  authorization: string,
): Promise<RecordingLookup> => {
  // Zoom session IDs may contain "/", "+", and "=". An unescaped ID changes
  // the request path and makes an otherwise valid recording look like an API error.
  const encodedSessionId = encodeURIComponent(sessionId);
  const response = await fetch(
    `https://api.zoom.us/v2/videosdk/sessions/${encodedSessionId}/recordings`,
    {
      headers: { Authorization: `Bearer ${authorization}` },
      cache: "no-store",
    },
  );

  const body = (await response.json().catch(() => null)) as
    | ZoomRecording
    | ZoomApiError
    | null;

  if (response.ok && body && "recording_files" in body) {
    return { status: "completed", data: body };
  }

  const zoomError =
    body && "code" in body ? body : null;

  // Zoom uses HTTP 404 / code 3301 when a session has no cloud recording.
  // Old or aborted session IDs can also return 400 and should not break the
  // complete appointment history.
  if (
    response.status === 404 ||
    response.status === 400 ||
    zoomError?.code === 3301
  ) {
    return { status: "not_found", data: null };
  }

  const message =
    zoomError?.message ??
    `Zoom returned HTTP ${response.status} while fetching recordings.`;

  if (response.status === 401 || response.status === 403) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Zoom recording access is not configured for this environment. Check the Video SDK API credentials and recording permissions.",
      cause: message,
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Zoom recordings are temporarily unavailable.",
    cause: message,
  });
};

const fetchRecordings = async (sessionIds: string[]) => {
  const uniqueSessionIds = [...new Set(sessionIds.filter(Boolean))];
  if (uniqueSessionIds.length === 0) return [];

  const authorization = generateVideoSdkApiJwt(
    env.ZOOM_API_KEY,
    env.ZOOM_API_SECRET,
  );
  const recordings = await Promise.all(
    uniqueSessionIds.map((sessionId) =>
      fetchRecording(sessionId, authorization),
    ),
  );

  return recordings.flatMap((recording) =>
    recording.status === "completed" ? [recording.data] : [],
  );
};

export const zoomRouter = createTRPCRouter({
  getLatestRecording: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.roomId),
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const sessionId = room.zoomSessionsIds.at(-1);
      if (!sessionId) return { status: "not_found", data: null } as const;

      return fetchRecording(
        sessionId,
        generateVideoSdkApiJwt(env.ZOOM_API_KEY, env.ZOOM_API_SECRET),
      );
    }),

  fetchAllRecordings: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.roomId),
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      return fetchRecordings(room.zoomSessionsIds);
    }),

  getAllRecordings: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.roomId),
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      return fetchRecordings(room.zoomSessionsIds);
    }),
});

type ZoomApiError = {
  code: number;
  message: string;
};

type ZoomRecordingFile = {
  id: string;
  status: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_size: number;
  download_url: string;
  recording_type?: string;
  file_name?: string;
  file_extension: string;
};

type ZoomRecording = {
  timezone: string;
  duration: number;
  session_id: string;
  session_name: string;
  start_time: string;
  total_size: number;
  recording_count: number;
  recording_files: ZoomRecordingFile[];
  participant_audio_files: ZoomRecordingFile[];
};
