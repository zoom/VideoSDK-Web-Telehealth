import { eq } from "drizzle-orm";
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
    const { alice, bob } = await db.transaction(async (tx) => {
      const [alice] = await tx
        .insert(schema.users)
        .values({ email: "alice@test.com", name: "Alice", role: "patient" })
        .returning();
      if (!alice) throw new Error("Failed to insert alice");

      const [patient] = await tx
        .insert(schema.patients)
        .values({
          id: alice.id,
          userId: alice.id,
          height: 170,
          weight: 60,
          bloodType: "A+",
          allergies: "Peanuts",
          medications: "None",
          DOB: new Date("2000-01-01"),
        })
        .returning();
      if (!patient) throw new Error("Failed to insert alice's patient profile");

      await tx
        .update(schema.users)
        .set({ patientId: patient.id })
        .where(eq(schema.users.id, alice.id));

      const [bob] = await tx
        .insert(schema.users)
        .values({ email: "bob@test.com", name: "Bob", role: "doctor" })
        .returning();
      if (!bob) throw new Error("Failed to insert bob");

      const [doctor] = await tx
        .insert(schema.doctors)
        .values({
          id: bob.id,
          userId: bob.id,
          position: "General Practitioner",
          department: "General Medicine",
        })
        .returning();
      if (!doctor) throw new Error("Failed to insert bob's doctor profile");

      await tx
        .update(schema.users)
        .set({ doctorId: doctor.id })
        .where(eq(schema.users.id, bob.id));

      return { alice, bob };
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
