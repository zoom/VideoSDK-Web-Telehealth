import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import moment from "moment";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  notes,
  rooms,
  roomForUser,
  transcripts,
  type User,
} from "~/server/db/schema";
import { generateSignature } from "~/utils/signJwt";

// ponytail: raw SQL because relational-query column interpolation re-aliases to the outer scope
const invitedRoomIds = (userId: string) =>
  sql`(select "A" from "_RoomForUser" where "B" = ${userId})`;

const flattenInvited = <T extends { User_CreatedFor: { user: User }[] }>(
  room: T,
): Omit<T, "User_CreatedFor"> & { User_CreatedFor: User[] } => ({
  ...room,
  User_CreatedFor: room.User_CreatedFor.map((m) => m.user),
});

export const sessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().refine((title) => title.length > 2, {
          message: "Title must be at least three characters",
        }),
        content: z.string().refine((content) => content.length > 2, {
          message: "Description must be at least three characters",
        }),
        IDs: z
          .array(z.string())
          .min(1)
          .refine((IDs) => IDs.length > 0, {
            message:
              "Ensure you've invited someone by clicking the 'add' button",
          }),
        time: z.date().refine((date) => date.getTime() > Date.now(), {
          message: "Appointment time must be in the future",
        }),
        duration: z.number().refine((duration) => duration > 0, {
          message: "Duration must be greater than 0",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, IDs, time, duration } = input;
      return ctx.db.transaction(async (tx) => {
        const [room] = await tx
          .insert(rooms)
          .values({
            title: title.trim(),
            content: content.trim(),
            createByUserId: ctx.session.user.id,
            duration,
            time,
          })
          .returning();
        if (!room) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create room",
          });
        }
        await tx
          .insert(roomForUser)
          .values(IDs.map((id) => ({ A: room.id, B: id })));
        return room;
      });
    }),
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    const result = await ctx.db.query.rooms.findMany({
      orderBy: [asc(rooms.time)],
      where: and(
        gte(rooms.time, time),
        or(
          eq(rooms.createByUserId, ctx.session.user.id),
          inArray(rooms.id, invitedRoomIds(ctx.session.user.id)),
        ),
      ),
      with: {
        User_CreatedFor: { with: { user: true } },
        User_CreatedBy: true,
      },
    });
    return result.map(flattenInvited);
  }),
  getCreatedUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    const result = await ctx.db.query.rooms.findMany({
      orderBy: [asc(rooms.time)],
      where: and(
        eq(rooms.createByUserId, ctx.session.user.id),
        gte(rooms.time, time),
      ),
      with: {
        User_CreatedFor: { with: { user: true } },
        User_CreatedBy: true,
      },
    });
    return result.map(flattenInvited);
  }),
  getInvitedUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    return ctx.db.query.rooms.findMany({
      orderBy: [asc(rooms.time)],
      where: and(
        gte(rooms.time, time),
        inArray(rooms.id, invitedRoomIds(ctx.session.user.id)),
      ),
    });
  }),
  getCreatedPast: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    const result = await ctx.db.query.rooms.findMany({
      orderBy: [asc(rooms.time)],
      where: and(
        lte(rooms.time, time),
        eq(rooms.createByUserId, ctx.session.user.id),
      ),
      with: {
        User_CreatedFor: { with: { user: true } },
        User_CreatedBy: true,
      },
    });
    return result.map(flattenInvited);
  }),
  getInvitedPast: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    return ctx.db.query.rooms.findMany({
      orderBy: [asc(rooms.time)],
      where: and(
        lte(rooms.time, time),
        inArray(rooms.id, invitedRoomIds(ctx.session.user.id)),
      ),
    });
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const raw = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.id),
        with: {
          User_CreatedBy: true,
          User_CreatedFor: { with: { user: true } },
        },
      });
      if (!raw) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      const room = flattenInvited(raw);
      if (room.createByUserId === ctx.session.user.id) {
        const jwt = generateSignature(`${room.id}`, 1);
        return { room, jwt };
      } else if (
        room.User_CreatedFor.findIndex((e) => e.id === ctx.session.user.id) !==
        -1
      ) {
        const jwt = generateSignature(`${room.id}`, 0);
        return { room, jwt };
      }
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to access this room",
      });
    }),
  getNotesFromRoom: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add notes",
        });
      }
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.id),
        with: { Notes: true },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      return room.Notes;
    }),
  addNote: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        contentS: z.string(),
        contentO: z.string(),
        contentA: z.string(),
        contentP: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add notes",
        });
      }
      const [note] = await ctx.db
        .insert(notes)
        .values({
          contentS: input.contentS,
          contentO: input.contentO,
          contentA: input.contentA,
          contentP: input.contentP,
          roomId: input.roomId,
        })
        .returning();
      return note;
    }),
  addTranscript: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add notes",
        });
      }
      const [transcript] = await ctx.db
        .insert(transcripts)
        .values({ content: input.content, roomId: input.roomId })
        .returning();
      return transcript;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.id),
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      if (room.createByUserId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this room",
        });
      }
      await ctx.db.delete(rooms).where(eq(rooms.id, input.id));
      return true;
    }),
  addZoomSessionId: protectedProcedure
    .input(z.object({ roomId: z.string(), zoomSessionsId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.roomId),
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      if (room.createByUserId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add zoom session id to this room",
        });
      }
      if (room.zoomSessionsIds.find((e) => e === input.zoomSessionsId)) {
        return true;
      }
      await ctx.db
        .update(rooms)
        .set({
          zoomSessionsIds: sql`array_append(${rooms.zoomSessionsIds}, ${input.zoomSessionsId})`,
        })
        .where(eq(rooms.id, input.roomId));
      return true;
    }),
});
