"use client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Label } from "~/components/ui/label";
import { UploadButton } from "~/components/UploadButton";

const InputFile = () => {
  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-3xl font-bold leading-none text-gray-700">Upload documents</h1>
        <div className="my-10 flex flex-col justify-center ">
          <Card className="flex min-h-64 w-80 flex-col justify-center self-center p-8">
            <Label htmlFor="picture">PDF</Label>
            <br />
            <UploadButton />
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
