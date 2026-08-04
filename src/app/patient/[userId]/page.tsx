"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EditPatient, ViewPatient } from "~/components/ViewPatient";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { api } from "~/utils/api";

export default function ViewPatientContainer() {
  const { userId } = useParams<{ userId: string }>();
  const { data: sessionData } = useSession();
  const { error, isError } = api.S3.getUploadList.useQuery({ userId }, { retry: 0 });
  const [isEdit, setEdit] = useState(false);

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <Card className="flex w-96 flex-col justify-center self-center p-8">Error: {error?.message}</Card>
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">back</Button>
        </Link>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
        <div className="mb-4 mt-8 flex w-full max-w-xl flex-row">
          <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700 ">Patient details</h1>
          {userId === sessionData?.user.id ? (
            <Button variant={"default"} className="ml-auto" onClick={() => setEdit(true)}>Edit</Button>
          ) : null}
        </div>
        {isEdit ? <EditPatient userId={userId} setEdit={setEdit} /> : <ViewPatient userId={userId} />}
        <Link href="/">
          <Button variant={"link"} className="mx-auto flex">back</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
