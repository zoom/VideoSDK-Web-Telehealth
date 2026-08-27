import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
  throw new Error("S3 env vars are not set; this script only applies to S3/R2 storage.");
}

const S3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

const response = await S3.send(
  new PutBucketCorsCommand({
    Bucket: env.S3_BUCKET, //TODO: replace
    CORSConfiguration: {
      CORSRules: [{
        AllowedHeaders: ["content-type"], //this is important, do not use "*"
        AllowedMethods: ["GET", "PUT", "HEAD"],
        AllowedOrigins: ["*"],
        ExposeHeaders: [],
        MaxAgeSeconds: 3000,
      }],
    },
  })
);

console.dir(response)