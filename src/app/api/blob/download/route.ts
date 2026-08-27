import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";

// Serves a PRIVATE Vercel Blob back to the browser. Auth is checked here, right
// next to get(), per Vercel's guidance (never rely on middleware/CDN for
// private-blob auth). Only the owning patient or a doctor may download.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) return new NextResponse("Missing fileId", { status: 400 });

  const file = await db.query.files.findFirst({
    where: eq(files.id, fileId),
    with: { patient: true },
  });
  if (!file?.storageKey) return new NextResponse("Not found", { status: 404 });

  const isOwner = file.patient.userId === session.user.id;
  if (session.user.role !== "doctor" && !isOwner) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const result = await get(file.storageKey, { access: "private" });
  if (result?.statusCode !== 200) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      // Sensitive documents: never persist to disk.
      "Cache-Control": "private, no-store",
    },
  });
}
