import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { and, eq, ilike } from "drizzle-orm";
import moment from "moment";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  doctors,
  files,
  patients,
  roomForUser,
  rooms,
  users,
} from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  searchUserByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ id: users.id, name: users.name, role: users.role })
        .from(users)
        .where(ilike(users.name, `%${input.name}%`));
      return result;
    }),
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({ id: users.id, name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (user) return user;
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }),
  getPatientDetails: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "doctor" &&
        ctx.session.user.id !== input.userId
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const patient = await ctx.db.query.patients.findFirst({
        where: eq(patients.userId, input.userId),
      });
      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
      const [user] = await ctx.db
        .select({ id: users.id, name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      return { ...patient, User: user };
    }),
  setPatientDetails: protectedProcedure
    .input(
      z.object({
        height: z.number(),
        weight: z.number(),
        bloodType: z.string(),
        allergies: z.string(),
        medications: z.string(),
        DOB: z.date(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id !== input.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [patient] = await ctx.db
        .update(patients)
        .set({
          height: input.height,
          weight: input.weight,
          bloodType: input.bloodType,
          allergies: input.allergies,
          medications: input.medications,
          DOB: input.DOB,
        })
        .where(eq(patients.userId, ctx.session.user.id))
        .returning();
      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
      return patient;
    }),
  getDoctors: protectedProcedure
    .input(z.object({ name: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.users.findMany({
        where: and(
          ilike(users.name, `%${input.name ?? ""}%`),
          eq(users.role, "doctor"),
        ),
        with: { doctor: true },
        limit: 20,
      });
      return result.map((u) => ({
        ...u,
        email: null,
        image: null,
        Doctor: u.doctor,
      }));
    }),
  getPatients: protectedProcedure
    .input(z.object({ name: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.users.findMany({
        where: and(
          ilike(users.name, `%${input.name ?? ""}%`),
          eq(users.role, "patient"),
        ),
        with: { patient: true },
        limit: 20,
      });
      return result.map((u) => ({
        ...u,
        email: null,
        image: null,
        Patient: u.patient,
      }));
    }),
  setDoctor: protectedProcedure
    .input(z.object({ department: z.string(), position: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [doctor] = await tx
          .insert(doctors)
          .values({
            userId: ctx.session.user.id,
            department: input.department,
            position: input.position,
          })
          .onConflictDoUpdate({
            target: doctors.userId,
            set: {
              department: input.department,
              position: input.position,
            },
          })
          .returning();
        if (!doctor) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
        const [user] = await tx
          .update(users)
          .set({ role: "doctor", doctorId: doctor.id })
          .where(eq(users.id, ctx.session.user.id))
          .returning();
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return { user, doctor };
      });
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [patient] = await tx
          .insert(patients)
          .values({
            userId: ctx.session.user.id,
            height: input.height,
            weight: input.weight,
            bloodType: input.bloodType,
            allergies: input.allergies,
            medications: input.medications,
            DOB: input.DOB,
          })
          .onConflictDoUpdate({
            target: patients.userId,
            set: {
              height: input.height,
              weight: input.weight,
              bloodType: input.bloodType,
              allergies: input.allergies,
              medications: input.medications,
              DOB: input.DOB,
            },
          })
          .returning();
        if (!patient) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
        const [user] = await tx
          .update(users)
          .set({ role: "patient", patientId: patient.id })
          .where(eq(users.id, ctx.session.user.id))
          .returning();
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return { user, patient };
      });
    }),
  setDemo: protectedProcedure
    .input(
      z.object({
        department: z.string(),
        position: z.string(),
        height: z.number(),
        weight: z.number(),
        bloodType: z.string(),
        allergies: z.string(),
        medications: z.string(),
        DOB: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (env.NEXT_PUBLIC_TESTMODE !== "TESTING") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Demo mode is disabled",
        });
      }
      const [doctor] = await ctx.db
        .insert(doctors)
        .values({
          userId: ctx.session.user.id,
          department: input.department,
          position: input.position,
        })
        .returning();
      const [patient] = await ctx.db
        .insert(patients)
        .values({
          userId: ctx.session.user.id,
          height: input.height,
          weight: input.weight,
          bloodType: input.bloodType,
          allergies: input.allergies,
          medications: input.medications,
          DOB: input.DOB,
        })
        .returning();
      if (!doctor || !patient) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      const [user] = await ctx.db
        .update(users)
        .set({ role: "doctor", patientId: patient.id, doctorId: doctor.id })
        .where(eq(users.id, ctx.session.user.id))
        .returning();
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const [bob] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, "bob@test.com"))
        .limit(1);

      const [room] = await ctx.db
        .insert(rooms)
        .values({
          title: "Demo Session",
          content: "This is a demo session",
          createByUserId: ctx.session.user.id,
          duration: 1,
          time: moment().utc().add(10, "day").toDate(),
        })
        .returning();
      if (room && bob) {
        await ctx.db
          .insert(roomForUser)
          .values({ A: room.id, B: bob.id });
      }

      await ctx.db.insert(files).values({
        name: "clteivw2g000ducoqlixsjqcg_26311_next.jpg",
        type: "application/pdf",
        patientId: patient.id,
      });

      return { user, patient };
    }),
  toggleRole: protectedProcedure.mutation(async ({ ctx }) => {
    if (env.NEXT_PUBLIC_TESTMODE !== "TESTING") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Demo mode is disabled",
      });
    }
    await ctx.db
      .update(users)
      .set({ role: ctx.session.user.role === "doctor" ? "patient" : "doctor" })
      .where(eq(users.id, ctx.session.user.id));
  }),
});

export type UserWithoutEmail = inferRouterOutputs<
  typeof userRouter
>["searchUserByName"][0];
