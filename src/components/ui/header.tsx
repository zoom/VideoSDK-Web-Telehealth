import Link from "next/link";
import { Button } from "./button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarImage } from "./avatar";

function Header() {
  const { status, data } = useSession();

  return (
    <div className="w-screen bg-white px-4 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <Image className="inline" src={"/logo.svg"} height={34} width={120} alt="product logo" />
        <div className="ml-auto flex gap-2">
          <Link
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            href="/"
          >
            Home
          </Link>
          <Link
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            href="/viewRooms"
          >
            Appointments
          </Link>
          <Link
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            href="/create"
          >
            Create
          </Link>
          {status === "authenticated" ? (
            <Button variant={"outline"} className="self-center" onClick={() => void signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button onClick={() => void signIn()}>Sign in</Button>
          )}
          <Avatar className="ml-4">
            <AvatarImage src={data?.user.image ?? undefined} alt="User Avatar" />
          </Avatar>
        </div>
      </header>
    </div>
  );
}

export default Header;
