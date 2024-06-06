import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarImage } from "./avatar";

function Header() {
  const { status, data } = useSession();
  const router = useRouter();

  return (
    <div className="w-screen bg-white px-4 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image className="inline" src={"/logo.svg"} height={24} width={80} alt="product logo" />
          <span className="text-xl leading-tight tracking-tighter">
            Video SDK <span>for Healthcare</span>
          </span>
        </Link>

        <div className="ml-auto flex gap-2">
          <Link
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              router.pathname === "/"
                ? "bg-gray-100 text-gray-900"
                : "bg-white hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
            href="/"
          >
            Home
          </Link>
          <Link
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              router.pathname === "/schedule"
                ? "bg-gray-100 text-gray-900"
                : "bg-white hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
            href="/schedule"
          >
            Appointments
          </Link>
          <Link
            className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              router.pathname === "/create"
                ? "bg-gray-100 text-gray-900"
                : "bg-white hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
            href="/create"
          >
            Create
          </Link>
          {status === "authenticated" ? (
            <>
              <Button variant={"outline"} className="self-center" onClick={() => void signOut()}>
                Sign Out
              </Button>
              <Avatar className="ml-4">
                <AvatarImage src={data?.user.image ?? undefined} alt="User Avatar" />
              </Avatar>
            </>
          ) : (
            <Button onClick={() => void signIn()}>Sign in</Button>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
