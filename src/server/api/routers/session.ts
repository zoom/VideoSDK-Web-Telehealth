import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateSignature } from "~/utils/signJwt";

export const sessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().refine((title) => title.length > 2, { message: "Title must be at least three characters" }),
        content: z.string().refine((content) => content.length > 2, { message: "Description must be at least three characters" }),
        IDs: z.array(z.string()).min(1).refine((IDs) => IDs.length > 0, { message: "Ensure you've invited someone by clicking the 'add' button" }),
        time: z.date().refine((date) => date.getTime() > Date.now(), { message: "Appointment time must be in the future" }),
        duration: z.number().refine((duration) => duration > 0, { message: "Duration must be greater than 0" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, IDs, time, duration } = input;
      return ctx.db.room.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          User_CreatedBy: { connect: { id: ctx.session.user.id } },
          duration,
          time,
          User_CreatedFor: { connect: IDs.map((id) => ({ id })) },
        },
      });
    }),
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    console.log(time);
    const rooms = await ctx.db.room.findMany({
      orderBy: { time: "asc" },
      where: {
        time: { gte: time },
        OR: [{ User_CreatedBy: { id: ctx.session.user.id } }, { User_CreatedFor: { some: { id: ctx.session.user.id } } }],
      },
      include: {
        User_CreatedFor: true,
        User_CreatedBy: true,
      },
    });
    return rooms;
  }),
  getCreatedUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    console.log(time);
    const rooms = await ctx.db.room.findMany({
      orderBy: { time: "asc" },
      where: {
        User_CreatedBy: { id: ctx.session.user.id },
        time: { gte: time },
      },
      include: {
        User_CreatedFor: true,
        User_CreatedBy: true,
      },
    });
    return rooms;
  }),
  getInvitedUpcoming: protectedProcedure.query(({ ctx }) => {
    const time = moment().utc().toDate();
    return ctx.db.room.findMany({
      orderBy: { time: "asc" },
      where: {
        time: { gte: time },
        User_CreatedFor: {
          some: { id: ctx.session.user.id },
        },
      },
    });
  }),
  getCreatedPast: protectedProcedure.query(async ({ ctx }) => {
    const time = moment().utc().toDate();
    const rooms = await ctx.db.room.findMany({
      orderBy: { time: "asc" },
      where: {
        time: { lte: time },
        User_CreatedBy: { id: ctx.session.user.id },
      },
      include: {
        User_CreatedFor: true,
        User_CreatedBy: true,
      },
    });
    return rooms;
  }),
  getInvitedPast: protectedProcedure.query(({ ctx }) => {
    const time = moment().utc().toDate();
    return ctx.db.room.findMany({
      orderBy: { time: "asc" },
      where: {
        time: { lte: time },
        User_CreatedFor: {
          some: { id: ctx.session.user.id },
        },
      },
    });
  }),
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const room = await ctx.db.room.findUnique({
      where: { id: input.id },
      include: { User_CreatedBy: true, User_CreatedFor: true },
    });
    if (room) {
      if (room.createByUserId === ctx.session.user.id) {
        const jwt = generateSignature(`${room.id}`, 1);
        return { room, jwt };
      } else if (room.User_CreatedFor.findIndex((e) => e.id === ctx.session.user.id) !== -1) {
        const jwt = generateSignature(`${room.id}`, 0);
        return { room, jwt };
      }
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to access this room",
      });
    } else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Room not found",
      });
    }
  }),
  getNotesFromRoom: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "doctor") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to add notes",
      });
    }
    const room = await ctx.db.room.findFirstOrThrow({
      where: { id: input.id },
      include: { User_CreatedBy: true, User_CreatedFor: true, Notes: true },
    });
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add notes",
        });
      }
      const note = await ctx.db.notes.create({
        data: {
          contentS: input.contentS,
          contentO: input.contentO,
          contentA: input.contentA,
          contentP: input.contentP,
          roomId: input.roomId,
        },
      });
      return note;
    }),
  addTranscript: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to add notes",
        });
      }
      const transcript = await ctx.db.transcript.create({
        data: {
          content: input.content,
          roomId: input.roomId,
        },
      });
      return transcript;
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const room = await ctx.db.room.findFirstOrThrow({
      where: { id: input.id },
      include: { User_CreatedBy: true },
    });
    if (room.createByUserId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to delete this room",
      });
    }
    await ctx.db.room.delete({ where: { id: input.id } });
    return true;
  }),
  addZoomSessionId: protectedProcedure.input(z.object({ roomId: z.string(), zoomSessionsId: z.string() })).mutation(async ({ ctx, input }) => {
    const room = await ctx.db.room.findFirstOrThrow({
      where: { id: input.roomId },
    });
    if (room.createByUserId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to add zoom session id to this room",
      });
    }
    if (room.zoomSessionsIds.find((e) => e === input.zoomSessionsId)) {
      return true;
    } else {
      await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          zoomSessionsIds: { push: input.zoomSessionsId },
        },
      });
      return true;
    }
  }),
});
