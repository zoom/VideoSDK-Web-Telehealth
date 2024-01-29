import { TRPCError } from "@trpc/server";
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
    .input(z.object({ title: z.string().min(3), content: z.string(), emails: z.array(z.string().email()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.room.create({
        data: {
          title: input.title,
          content: input.content,
          User_CreatedBy: { connect: { id: ctx.session.user.id } },
          createdForEmail: input.emails,
        },
      });
    }),

  getCreated: protectedProcedure.query(({ ctx }) => {
    return ctx.db.room.findMany({
      orderBy: { createdAt: "desc" },
      where: { User_CreatedBy: { id: ctx.session.user.id } },
    });
  }),

  getInvited: protectedProcedure.query(({ ctx }) => {
    return ctx.db.room.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        createdForEmail: { has: ctx.session.user.email },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
      });
      if (room) {
        if ((room.createdById === ctx.session.user.id)) {
          const jwt = generateSignature(
            `${room.id}`,
            1,
          )
          return { room, jwt };
        }
        else if (room.createdForEmail.includes(ctx.session.user.email!)) {
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
});
