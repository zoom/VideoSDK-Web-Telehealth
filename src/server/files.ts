import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { patients } from "~/server/db/schema";

/**
 * Resolve the patient a file operation targets. A patient acts on their own
 * record; a doctor may act on any patient (same coarse role rule as
 * getUploadList). Throws Error("FORBIDDEN") or Error("NOT_FOUND"); callers map
 * to their transport's error type.
 * ponytail: role-level check; scope to appointment membership for production.
 */
export async function resolveTargetPatient(
  sessionUser: { id: string; role?: string | null },
  targetUserId: string,
) {
  if (targetUserId !== sessionUser.id && sessionUser.role !== "doctor") {
    throw new Error("FORBIDDEN");
  }
  const patient = await db.query.patients.findFirst({
    where: eq(patients.userId, targetUserId),
  });
  if (!patient) throw new Error("NOT_FOUND");
  return patient;
}
