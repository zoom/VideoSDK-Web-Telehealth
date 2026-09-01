"use client";

import { CalendarDays, HeartPulse, Home, LogOut, Plus } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";
import { Avatar, AvatarImage } from "./avatar";
import { Button } from "./button";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schedule", label: "Appointments", icon: CalendarDays },
  { href: "/create", label: "New appointment", icon: Plus },
];

function Header() {
  const { status, data } = useSession();
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold tracking-tight">
              Care Rooms
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Video health
            </span>
          </span>
          <span className="sr-only sm:hidden">Care Rooms</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-1 flex items-center gap-2 border-l pl-3">
          {status === "authenticated" ? (
            <>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage
                  src={data.user.image ?? undefined}
                  alt={data.user.name ?? "User"}
                />
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void signOut()}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => void signIn()}>
              Sign in
            </Button>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
