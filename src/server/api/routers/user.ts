import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  searchUserByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findMany({
        where: { name: { contains: input.name, mode: "insensitive" } },
        select: { id: true, name: true, role: true },
      });
      if (user) {
        return user;
      } else {
        return [];
      }
    }),
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id }, select: { id: true, name: true, role: true }, });
      if (user) {
        return user;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
  getPatientDetails: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor" && ctx.session.user.id !== input.userId) throw new TRPCError({ code: "FORBIDDEN" });
      const patient = await ctx.db.patient.findUnique({
        where: { userId: input.userId },
        include: { User: { select: { id: true, name: true, role: true } } },
      });
      if (patient) {
        return patient;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
    }),
  getDoctors: protectedProcedure.input(z.object({ name: z.string().nullable() })).query(async ({ ctx, input }) => {
    const doctors = await ctx.db.user.findMany({
      where: {
        name: {
          contains: input.name ? input.name : "",
          mode: "insensitive"
        }, role: "doctor"
      },
      take: 20,
      include: { Doctor: true },
    });
    const doctorWithoutEmail = doctors.map((d) => ({ ...d, email: null, image: null }));
    return doctorWithoutEmail;
  }),
  getPatients: protectedProcedure.input(z.object({ name: z.string().nullable() })).query(async ({ ctx, input }) => {
    const patients = await ctx.db.user.findMany({
      where: {
        name: {
          contains: input.name ? input.name : "",
          mode: "insensitive"
        }, role: "patient"
      },
      take: 20,
      include: { Patient: true },
    });
    const patientsWithoutEmail = patients.map((p) => ({ ...p, email: null, image: null }));
    return patientsWithoutEmail;
  }),
  setDoctor: protectedProcedure
    .input(
      z.object({
        department: z.string(),
        position: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doctor = await ctx.db.doctor.create({
        data: {
          userId: ctx.session.user.id,
          department: input.department,
          position: input.position,
        },
      });
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { role: "doctor", doctorId: doctor.id },
      });
      if (user) {
        return { doctor };
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        }); ``
      }
    }),
  setPatient: protectedProcedure
    .input(
      z.object({
        height: z.number(),
        weight: z.number(),
        bloodType: z.string(),
        allergies: z.string(),
        medications: z.string(),
        DOB: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.create({
        data: {
          userId: ctx.session.user.id,
          height: input.height,
          weight: input.weight,
          bloodType: input.bloodType,
          allergies: input.allergies,
          medications: input.medications,
          DOB: input.DOB,
        },
      });
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { role: "patient", patientId: patient.id },
      });
      if (user) {
        return { patient };
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
});

export type UserWithoutEmail = inferRouterOutputs<typeof userRouter>["searchUserByName"][0];