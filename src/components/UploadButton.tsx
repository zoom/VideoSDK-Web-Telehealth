"use client";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { env } from "~/env";
import { api } from "~/utils/api";

// Upload a PDF for a patient. Omit `userId` to upload for the signed-in patient;
// pass a patient's userId (doctor only) to upload on their behalf. The server
// re-authorizes either way, so `userId` is a target, not a trust boundary.
export function UploadButton({
  userId,
  onUploaded,
}: {
  userId?: string;
  onUploaded?: () => void;
}) {
  const backend = api.S3.getBackend.useQuery();
  const uploadUrl = api.S3.createPresignedUrl.useMutation();
  const registerUpload = api.S3.registerUpload.useMutation();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const inputref = useRef<HTMLInputElement>(null);

  return (
    <>
      <Input
        id="picture"
        type="file"
        ref={inputref}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      {status && <p className="mt-2">{status}</p>}
      <Button
        className="mt-2"
        disabled={loading || !file}
        onClick={async () => {
          if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
            setStatus("File upload is disabled in demo mode");
            return;
          }
          if (!file) return;
          setLoading(true);
          setStatus("Uploading...");
          try {
            if (backend.data === "blob") {
              // Server upload: the file streams through /api/blob/upload, which
              // authenticates via OIDC and inserts the DB row. The route builds
              // the object key and authorizes the target patient.
              const form = new FormData();
              form.set("file", file);
              if (userId) form.set("userId", userId);
              const res = await fetch("/api/blob/upload", {
                method: "POST",
                body: form,
              });
              if (!res.ok) throw new Error(await res.text());
            } else {
              const { url, filename } = await uploadUrl.mutateAsync({
                filename: file.name,
                userId,
              });
              const newfile = new File([file], filename, { type: file.type });
              await fetch(url, { method: "PUT", body: newfile });
              await registerUpload.mutateAsync({ filename, userId });
            }
            inputref.current!.value = "";
            setFile(null);
            setStatus("File uploaded");
            onUploaded?.();
          } catch (e) {
            setStatus("Error uploading file");
            console.error(e);
          }
          setLoading(false);
        }}
      >
        Upload
      </Button>
    </>
  );
}
