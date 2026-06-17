import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { files, patients } from "~/server/db/schema";

const S3 = new S3Client({
  region: "auto",
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export const S3Router = createTRPCRouter({
  createPresignedUrl: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const filename = `${ctx.session.user.id}_${new Date().getTime().toString().slice(8)}_${input.filename}`;
      const url = await getSignedUrl(
        S3,
        new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: filename }),
        { expiresIn: 3600 },
      );
      return { url, filename };
    }),
  registerUpload: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const patient = await ctx.db.query.patients.findFirst({
        where: eq(patients.userId, ctx.session.user.id),
      });
      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
      await ctx.db.insert(files).values({
        name: input.filename,
        type: "PDF",
        patientId: patient.id,
      });
    }),
  getUploadList: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (
        ctx.session.user.role !== "doctor" &&
        ctx.session.user.id !== input.userId
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const patient = await ctx.db.query.patients.findFirst({
        where: eq(patients.userId, input.userId),
        with: { files: { orderBy: [desc(files.createdAt)] } },
      });
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      if (!patient.files) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Files not found",
        });
      }
      return patient.files;
    }),
  getDownloadLink: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      const url = await getSignedUrl(
        S3,
        new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: input.filename }),
        { expiresIn: 3600 },
      );
      return url;
    }),
});
