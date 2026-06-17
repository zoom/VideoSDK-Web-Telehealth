import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL or DATABASE_DIRECT_URL must be set");
}

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  // Match the existing Prisma-managed schema; keep introspect output sane.
  introspect: { casing: "preserve" },
} satisfies Config;
