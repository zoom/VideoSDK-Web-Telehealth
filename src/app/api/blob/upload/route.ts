import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";

// Client-upload token endpoint for a PRIVATE Vercel Blob store. The browser
// uploads directly to Blob with a scoped token; this route only authorizes the
// request. Private blobs are not publicly readable — they are served back
// through /api/blob/download, which re-checks appointment/ownership auth.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true,
        };
      },
      // Fires on Vercel only. The DB row is written by the registerUpload tRPC
      // call from the client, so this is a no-op.
      onUploadCompleted: async () => {
        /* intentionally empty */
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
