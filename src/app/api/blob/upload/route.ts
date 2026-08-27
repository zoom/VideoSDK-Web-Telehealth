import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { resolveTargetPatient } from "~/server/files";
import { files } from "~/server/db/schema";

// Server upload to a PRIVATE Vercel Blob store. The file streams through this
// Function, which authenticates on OIDC (no read-write token needed) — the mode
// the Deploy Button provisions. ponytail: ~4.5 MB body cap through the Function;
// for larger files switch to client uploads (requires BLOB_READ_WRITE_TOKEN).
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const targetUserId = (form.get("userId") as string) || session.user.id;
  if (!(file instanceof File)) {
    return new NextResponse("Missing file", { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return new NextResponse("Only PDF uploads are allowed", { status: 400 });
  }

  let patient;
  try {
    patient = await resolveTargetPatient(session.user, targetUserId);
  } catch (e) {
    const forbidden = (e as Error).message === "FORBIDDEN";
    return new NextResponse(forbidden ? "Forbidden" : "Patient not found", {
      status: forbidden ? 403 : 404,
    });
  }

  const filename = `${patient.userId}_${Date.now().toString().slice(8)}_${file.name}`;
  const blob = await put(filename, file, {
    access: "private",
    addRandomSuffix: true,
  });

  await db.insert(files).values({
    name: filename,
    storageKey: blob.pathname,
    type: "PDF",
    patientId: patient.id,
  });

  return NextResponse.json({ ok: true });
}
