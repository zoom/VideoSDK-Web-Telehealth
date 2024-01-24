import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Zoom Telehealth Demo</h1>
        <div className="my-10 flex flex-col justify-center ">
          {status === "authenticated" ? (
            <>
              <div className="my-10 flex flex-col items-center">
                <Link href={"/view"}>
                  <Button>View Rooms</Button>
                </Link>
                <br />
                <Link href={"/create"}>
                  <Button>Create Rooms</Button>
                </Link>
                <br />
              </div>
              <h3 className="m-2">Signed in as: {data?.user.name}</h3>
              <Button variant={"outline"} onClick={() => void signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant={"outline"} onClick={() => void signIn("github")}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
