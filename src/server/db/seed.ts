import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL must be set");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Start seeding ...");
  try {
    const [alice] = await db
      .insert(schema.users)
      .values({ email: "alice@test.com", name: "Alice", role: "patient" })
      .returning();
    if (!alice) throw new Error("Failed to insert alice");

    await db.insert(schema.patients).values({
      id: alice.id,
      userId: alice.id,
      height: 170,
      weight: 60,
      bloodType: "A+",
      allergies: "Peanuts",
      medications: "None",
      DOB: new Date("2000-01-01"),
    });

    const [bob] = await db
      .insert(schema.users)
      .values({ email: "bob@test.com", name: "Bob", role: "doctor" })
      .returning();
    if (!bob) throw new Error("Failed to insert bob");

    await db.insert(schema.doctors).values({
      id: bob.id,
      userId: bob.id,
      position: "General Practitioner",
      department: "General Medicine",
    });

    console.log("Seeding finished.");
    console.log({ alice, bob });
  } catch (e) {
    console.error("Seed error:", e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
