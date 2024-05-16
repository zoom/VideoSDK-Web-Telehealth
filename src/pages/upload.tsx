import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { env } from "~/env";
import { api } from "~/utils/api";

const InputFile = () => {
  const uploadUrl = api.S3.createPresignedUrl.useMutation();
  const registerUpload = api.S3.registerUpload.useMutation();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const inputref = useRef<HTMLInputElement>(null);

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-3xl font-bold leading-none text-gray-700">Upload documents</h1>
        <div className="my-10 flex flex-col justify-center ">
          <Card className="flex min-h-64 w-80 flex-col justify-center self-center p-8">
            <Label htmlFor="picture">PDF</Label>
            <br />
            <Input
              id="picture"
              type="file"
              ref={inputref}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
            />
            <br />
            <p>{status}</p>
            <br />
            <Button
              disabled={loading}
              onClick={async () => {
                if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
                  if (file) {
                    setStatus("File upload is disabled in demo mode");
                    return;
                  }
                }
                if (file) {
                  setLoading(true);
                  setStatus("Uploading...");
                  const { url, filename } = await uploadUrl.mutateAsync({ filename: file.name });
                  const newfile = new File([file], filename, { type: file.type });
                  await fetch(url, {
                    method: "PUT",
                    body: newfile,
                  }).catch((e) => {
                    setStatus("Error uploading file");
                    console.error(e);
                    setLoading(false);
                  });
                  await registerUpload.mutateAsync({ filename });
                  inputref.current!.value = "";
                  setStatus("File uploaded");
                  setLoading(false);
                }
              }}
            >
              Upload
            </Button>
          </Card>
          <Link href="/">
            <Button variant={"link"} className="mx-auto mt-4 flex">
              back
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InputFile;
