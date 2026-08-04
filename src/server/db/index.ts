import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

const DB_CLIENT_VERSION = 2;

const globalForDb = globalThis as unknown as {
  telehealthDb:
    | {
        client: ReturnType<typeof postgres>;
        url: string;
        version: number;
      }
    | undefined;
};

const cachedDb = globalForDb.telehealthDb;
const canReuseClient =
  cachedDb?.url === env.DATABASE_URL &&
  cachedDb.version === DB_CLIENT_VERSION;

if (cachedDb && !canReuseClient) {
  // HMR preserves globalThis. Retire a client created with an old URL or old
  // pool settings so editing .env/config does not leave auth using it forever.
  void cachedDb.client.end({ timeout: 1 });
}

const client =
  (canReuseClient ? cachedDb.client : undefined) ??
  postgres(env.DATABASE_URL, {
    prepare: false,
    // Keep the dev/proxy bundles from opening large independent pools, and
    // retire idle cloud connections before infrastructure closes them.
    max: 5,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.telehealthDb = {
    client,
    url: env.DATABASE_URL,
    version: DB_CLIENT_VERSION,
  };
}

export const db = drizzle(client, {
  schema,
  logger: env.NODE_ENV === "development",
});

export { schema };
