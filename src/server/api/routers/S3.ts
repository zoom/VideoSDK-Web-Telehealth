import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  S3Client,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

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
    .mutation(async ({ ctx }) => {
      return getSignedUrl(S3, new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: `${ctx.session.user.id}_${new Date().getTime()}` }), { expiresIn: 3600 })
    })
});

