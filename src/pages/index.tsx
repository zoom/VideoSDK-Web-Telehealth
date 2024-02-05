import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

export default function Home() {
  const { data, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (data?.user.role === undefined) {
    void router.push("/onboarding");
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <h1>Loading...</h1>
    </div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Zoom Telehealth Demo</h1>
        <Button variant={"outline"} onClick={() => void signIn("github")}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="my-10 flex text-5xl font-bold leading-none text-gray-700">Zoom Telehealth Demo</h1>
        <div className="my-10 flex flex-col justify-center ">
          {data?.user.role === "doctor" ? (
            <>
              <h3 className="m-2">Signed in as Doctor: {data?.user.name}</h3>
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
              <Button variant={"outline"} onClick={() => void signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <div className="my-10 flex flex-col items-center">
                <Link href={"/view"}>
                  <Button>View Rooms</Button>
                </Link>
                <br />
              </div>
              <h3 className="m-2">Signed in as Patient: {data?.user.name}</h3>
              <Button variant={"outline"} onClick={() => void signOut()}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
