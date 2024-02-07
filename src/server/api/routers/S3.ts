import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { z } from "zod";

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
      const filename = `${ctx.session.user.id}_${new Date().getTime().toString().slice(8)}_${input.filename}`
      const url = await getSignedUrl(S3, new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: filename }), { expiresIn: 3600 })
      return { url, filename }
    }),
  registerUpload: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.patient.update({
        data: {
          filesIds: { push: input.filename },
        },
        where: {
          id: ctx.session.user.id
        }
      })
    }),
  getUploadList: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.userId
        },
        include: {
          Patient: true
        }
      })
      return user?.Patient?.filesIds
    }),
  getDownloadLink: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .query(async ({ input, ctx }) => {
      const url = await getSignedUrl(S3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: input.filename }), { expiresIn: 3600 })
      return url
    }),
});

// const response = await S3.send(
//   new PutBucketCorsCommand({
//     Bucket: env.S3_BUCKET, //TODO: replace
//     CORSConfiguration: {
//       CORSRules: new Array({
//         AllowedHeaders: ["content-type"], //this is important, do not use "*"
//         AllowedMethods: ["GET", "PUT", "HEAD"],
//         AllowedOrigins: ["*"],
//         ExposeHeaders: [],
//         MaxAgeSeconds: 3000,
//       }),
//     },
//   })
// );
// console.dir(response)