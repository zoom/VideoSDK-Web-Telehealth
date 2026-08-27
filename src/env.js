import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.url().refine((str) => !str.includes("YOUR_MYSQL_URL_HERE"), "You forgot to change the default URL"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must contain at least 32 characters"),
    AUTH_TRUST_HOST: z.enum(["true", "false"]).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.url()
    ),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    // Storage is pluggable: set either the S3 vars OR BLOB_READ_WRITE_TOKEN.
    // The S3 vars are optional so a Vercel Blob-only deploy can omit them.
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    // "auto" works for Cloudflare R2; set a real AWS region for Amazon S3.
    S3_REGION: z.string().default("auto"),
    // Auto-injected by the Vercel Blob integration; presence selects Blob storage.
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    ZOOM_SDK_KEY: z.string(),
    ZOOM_SDK_SECRET: z.string(),
    ZOOM_API_KEY: z.string(),
    ZOOM_API_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_TESTMODE: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TESTMODE: process.env.NEXT_PUBLIC_TESTMODE,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    ZOOM_SDK_KEY: process.env.ZOOM_SDK_KEY,
    ZOOM_SDK_SECRET: process.env.ZOOM_SDK_SECRET,
    ZOOM_API_KEY: process.env.ZOOM_API_KEY,
    ZOOM_API_SECRET: process.env.ZOOM_API_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
