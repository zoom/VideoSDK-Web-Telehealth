import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
      const url = await getSignedUrl(S3, new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: filename }), { expiresIn: 3600 });
      return { url, filename };
    }),
  registerUpload: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.patient.update({
        data: {
          files: { create: { name: input.filename, type: "PDF" } },
        },
        where: {
          userId: ctx.session.user.id,
        },
      });
    }),
  getUploadList: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "doctor" && ctx.session.user.id !== input.userId) throw new TRPCError({ code: "FORBIDDEN" });
      const user = await ctx.db.patient.findUnique({
        where: {
          userId: input.userId,
        },
        include: {
          files: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (!user.files) throw new TRPCError({ code: "NOT_FOUND", message: "Files not found" });
      return user.files;
    }),
  getDownloadLink: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      // if (ctx.session.user.role !== "doctor" || ctx.session.user.id !== input.userId) throw new TRPCError({ code: "FORBIDDEN" });
      const url = await getSignedUrl(S3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: input.filename }), { expiresIn: 3600 });
      return url;
    }),
});
