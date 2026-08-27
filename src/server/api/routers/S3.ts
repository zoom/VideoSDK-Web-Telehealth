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
import { resolveTargetPatient } from "~/server/files";
import { files, patients } from "~/server/db/schema";

// Storage backend: Vercel Blob when a store is connected (OIDC sets BLOB_STORE_ID;
// self-hosted may set the read-write token instead), else S3/R2.
const STORAGE_BACKEND =
  env.BLOB_STORE_ID ?? env.BLOB_READ_WRITE_TOKEN ? "blob" : "s3";

async function requirePatient(
  sessionUser: { id: string; role?: string | null },
  targetUserId: string,
) {
  try {
    return await resolveTargetPatient(sessionUser, targetUserId);
  } catch (e) {
    throw new TRPCError({
      code: (e as Error).message === "FORBIDDEN" ? "FORBIDDEN" : "NOT_FOUND",
    });
  }
}

let s3Client: S3Client | undefined;
function getS3() {
  if (
    !env.S3_ENDPOINT ||
    !env.S3_BUCKET ||
    !env.S3_ACCESS_KEY_ID ||
    !env.S3_SECRET_ACCESS_KEY
  ) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "S3 storage is not configured",
    });
  }
  return (s3Client ??= new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  }));
}

export const S3Router = createTRPCRouter({
  getBackend: protectedProcedure.query(() => STORAGE_BACKEND),
  createPresignedUrl: protectedProcedure
    .input(z.object({ filename: z.string(), userId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const patient = await requirePatient(
        ctx.session.user,
        input.userId ?? ctx.session.user.id,
      );
      const filename = `${patient.userId}_${new Date().getTime().toString().slice(8)}_${input.filename}`;
      const url = await getSignedUrl(
        getS3(),
        new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: filename }),
        { expiresIn: 3600 },
      );
      return { url, filename };
    }),
  registerUpload: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        storageKey: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const patient = await requirePatient(
        ctx.session.user,
        input.userId ?? ctx.session.user.id,
      );
      await ctx.db.insert(files).values({
        name: input.filename,
        storageKey: input.storageKey,
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
        getS3(),
        new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: input.filename }),
        { expiresIn: 3600 },
      );
      return url;
    }),
});
