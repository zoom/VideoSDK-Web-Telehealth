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
      title: z.string().min(3), content: z.string(),
      emails: z.array(z.string().email()).min(1),
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

  getCreatedUpcoming: protectedProcedure
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

  getInvitedUpcoming: protectedProcedure
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

  getCreatedPast: protectedProcedure
    .query(async ({ ctx }) => {
      const time = moment().utc().toDate();
      const rooms = await ctx.db.room.findMany({
        orderBy: { time: "asc" },
        where: {
          time: { lte: time },
          User_CreatedBy: { id: ctx.session.user.id },
        },
        include: {
          User_CreatedFor: true,
          User_CreatedBy: true
        }
      });
      return rooms;
    }),

  getInvitedPast: protectedProcedure
    .query(({ ctx }) => {
      const time = moment().utc().toDate();
      return ctx.db.room.findMany({
        orderBy: { time: "asc" },
        where: {
          time: { lte: time },
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

  getUserByEmail: protectedProcedure.input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
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

  getPatientDetails: protectedProcedure.input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor" && ctx.session.user.id !== input.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      const patient = await ctx.db.patient.findUnique({
        where: { userId: input.userId },
        include: { User: true }
      });
      if (patient) {
        return patient;
      }
      else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
    }),

  getDoctors: protectedProcedure.query(async ({ ctx }) => {
    const doctors = await ctx.db.doctor.findMany({
      include: { User: true }
    });
    return doctors;
  }),

  getPatients: protectedProcedure.query(async ({ ctx }) => {
    const patients = await ctx.db.patient.findMany({
      include: { User: true }
    });
    return patients;
  }),

  setDoctor: protectedProcedure.input(z.object({
    department: z.string(), position: z.string()
  })).mutation(async ({ ctx, input }) => {
    const doctor = await ctx.db.doctor.create({
      data: {
        userId: ctx.session.user.id, department: input.department, position: input.position
      }
    });
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: 'doctor', doctorId: doctor.id }
    });
    if (user) {
      return { user, doctor };
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),

  setPatient: protectedProcedure.input(z.object({
    height: z.number(),
    weight: z.number(),
    bloodType: z.string(),
    allergies: z.string(),
    medications: z.string(),
    DOB: z.date(),
  })).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: 'patient' }
    });
    const patient = await ctx.db.patient.create({
      data: {
        userId: ctx.session.user.id, height: input.height, weight: input.weight,
        bloodType: input.bloodType, allergies: input.allergies,
        medications: input.medications, DOB: input.DOB
      }
    });
    if (user) {
      return { user, patient };
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
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
      const room = await ctx.db.room.findFirstOrThrow({
        where: { id: input.id },
        include: { User_CreatedBy: true, User_CreatedFor: true, Notes: true }
      });
      return room.Notes;
      // if (room) {
      //   if ((room.createByUserId === ctx.session.user.id)) {
      //     return room.Notes;
      //   }
      //   else if (room.User_CreatedFor.findIndex(e => e.id === ctx.session.user.id) !== -1) {
      //     return room.Notes;
      //   }
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You are not allowed to access this room",
      //   });
      // }
      // else {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "Room not found",
      //   });
      // }
    }),

  addNote: protectedProcedure.input(z.object({
    roomId: z.string(),
    content: z.string(),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "doctor") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to add notes",
      });
    }
    const note = await ctx.db.notes.create({
      data: {
        content: input.content,
        roomId: input.roomId,
      }
    });
    return note;
  })
});
