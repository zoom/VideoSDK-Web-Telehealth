import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/utils/api";

export default function Home() {
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Zoom Telehealth Demo</title>
        </Head>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
          <h1 className="my-10 text-5xl font-bold leading-none text-gray-700">
            Zoom Telehealth Demo
          </h1>
          <div className="my-10">
            <Button onClick={() => void signIn()}>Sign In</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">
          Zoom Telehealth Demo
        </h1>
        <div className="my-10 flex flex-col">
          <Link href={"/view"}>
            <Button>View Posts</Button>
          </Link>
          <br />
        </div>
        <div className="my-10 flex flex-col justify-center ">
          <h3 className="m-2">Signed in as: {data?.user.name}</h3>
          <Button variant={"outline"} onClick={() => void signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
