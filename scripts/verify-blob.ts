// Throwaway check: proves the private-Blob round-trip the app relies on
// (client-upload stores a pathname; /api/blob/download fetches it via get()).
// Run: BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." bun scripts/verify-blob.ts
// Requires a PRIVATE Blob store's token. Deletes what it writes.
import { del, get, put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN (from a private Blob store)");

// Minimal valid one-page PDF.
const pdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 100 100]>>endobj\n" +
    "trailer<</Root 1 0 R>>\n%%EOF",
);

const { pathname } = await put("verify_test.pdf", pdf, {
  access: "private",
  addRandomSuffix: true,
  token,
});
console.log("put ok, pathname:", pathname);

const result = await get(pathname, { access: "private", token });
if (result?.statusCode !== 200) throw new Error(`get failed: ${result?.statusCode}`);

const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
if (!bytes.equals(pdf)) throw new Error("round-trip bytes mismatch");
console.log("get ok, contentType:", result.blob.contentType, "bytes:", bytes.length);

await del(pathname, { token });
console.log("cleanup ok — private Blob round-trip verified ✅");
