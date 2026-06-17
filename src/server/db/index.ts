import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false,
  });

if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, {
  schema,
  logger: env.NODE_ENV === "development",
});

export { schema };
