import {
  CalendarDays,
  CalendarPlus,
  FileUp,
  Stethoscope,
  UserRoundSearch,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { api } from "~/utils/api";
import UpcomingSession from "./UpcomingSession";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type DashboardProps = {
  role: "doctor" | "patient";
};

const doctorActions = [
  {
    href: "/create",
    label: "New appointment",
    description: "Schedule a visit",
    icon: CalendarPlus,
  },
  {
    href: "/schedule",
    label: "Full schedule",
    description: "Past and upcoming",
    icon: CalendarDays,
  },
  {
    href: "/patients",
    label: "Find a patient",
    description: "Open a patient record",
    icon: UserRoundSearch,
  },
];

const Dashboard = ({ role }: DashboardProps) => {
  const { data: userData } = useSession();
  const { data, isLoading } = api.room.getUpcoming.useQuery();
  const patientActions = [
    {
      href: "/create",
      label: "New appointment",
      description: "Request a visit",
      icon: CalendarPlus,
    },
    {
      href: "/schedule",
      label: "Full schedule",
      description: "Past and upcoming",
      icon: CalendarDays,
    },
    {
      href: "/doctors",
      label: "Find a doctor",
      description: "Browse care providers",
      icon: Stethoscope,
    },
    {
      href: `/patient/${userData?.user.id ?? ""}`,
      label: "Health profile",
      description: "Review your details",
      icon: UserRoundSearch,
    },
    {
      href: "/upload",
      label: "Documents",
      description: "Share a care file",
      icon: FileUp,
    },
  ];
  const actions = role === "doctor" ? doctorActions : patientActions;
  const firstName = userData?.user.name?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {role === "doctor" ? "Clinician workspace" : "Your care"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Good to see you, {role === "doctor" ? "Dr. " : ""}
          {firstName}.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your next visit and the tools you use most are collected here.
        </p>
      </div>

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="next-appointment">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              On your timeline
            </p>
            <h2 id="next-appointment" className="text-xl font-bold">
              Next appointment
            </h2>
          </div>
          <Link
            href="/schedule"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : data?.[0] ? (
          <UpcomingSession data={data[0]} />
        ) : (
          <Card className="flex min-h-40 items-center justify-center border-dashed p-8 text-center text-sm text-muted-foreground">
            No upcoming appointments. Your next visit will appear here.
          </Card>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
