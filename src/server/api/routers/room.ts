import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { generateSignature } from "~/utils/signJwt";

export const roomRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3), content: z.string(), emails: z.array(z.string().email()).min(1),
      time: z.date(), duration: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { title, content, emails, time, duration } = input;
      return ctx.db.room.create({
        data: {
          title,
          content,
          User_CreatedBy: { connect: { id: ctx.session.user.id } },
          duration,
          time,
          User_CreatedFor: { connect: emails.map((email) => ({ email })) },
        },
      });
    }),

  getCreated: protectedProcedure
    .query(async ({ ctx }) => {
      const time = moment().utc().toDate();
      console.log(time);
      const rooms = await ctx.db.room.findMany({
        orderBy: { time: "asc" },
        where: {
          User_CreatedBy: { id: ctx.session.user.id },
          time: { gte: time }
        },
        include: {
          User_CreatedFor: true,
          User_CreatedBy: true
        }
      });
      return rooms;
    }),

  getInvited: protectedProcedure
    .query(({ ctx }) => {
      const time = moment().utc().toDate();
      return ctx.db.room.findMany({
        orderBy: { time: "asc" },
        where: {
          time: { gte: time },
          User_CreatedFor: {
            some: { id: ctx.session.user.id }
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
        include: { User_CreatedBy: true, User_CreatedFor: true }
      });
      if (room) {
        if ((room.createByUserId === ctx.session.user.id)) {
          const jwt = generateSignature(
            `${room.id}`,
            1,
          )
          return { room, jwt };
        }
        else if (room.User_CreatedFor.findIndex(e => e.id === ctx.session.user.id) !== -1) {
          const jwt = generateSignature(
            `${room.id}`,
            0,
          )
          return { room, jwt };
        }
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to access this room",
        });
      }
      else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
    }),

  getUserByEmail: protectedProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({ where: { email: input.email } });
    if (user) {
      return user;
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),

  setRole: protectedProcedure.input(z.enum(['patient', 'doctor'])).mutation(async ({ ctx, input }) => {
    let user;
    if (input === 'patient') {
      user = await ctx.db.user.update({ where: { id: ctx.session.user.id }, data: { role: input, Patient: { create: { userId: ctx.session.user.id } } } });
    } else {
      user = await ctx.db.user.update({ where: { id: ctx.session.user.id }, data: { role: input, Doctor: { create: { userId: ctx.session.user.id } } } });
    }
    if (user) {
      return user;
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),
});
