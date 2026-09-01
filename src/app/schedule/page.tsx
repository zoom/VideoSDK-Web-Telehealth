"use client";

import { CalendarPlus, CalendarX2 } from "lucide-react";
import Link from "next/link";

import UpcomingSession from "~/components/UpcomingSession";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Skeleton } from "~/components/ui/skeleton";
import { type Room } from "~/server/db/schema";
import { api } from "~/utils/api";

export default function SchedulePage() {
  const { data: roomsPast, isLoading: loadingPast } =
    api.room.getPast.useQuery();
  const { data: roomsUpcoming, isLoading: loadingUpcoming } =
    api.room.getUpcoming.useQuery();

  const upcoming = roomsUpcoming
    ?.slice()
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const past = roomsPast
    ?.slice()
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Appointment timeline
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Your schedule</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything ahead, plus a clear history of past visits.
            </p>
          </div>
          <Button asChild>
            <Link href="/create">
              <CalendarPlus className="h-4 w-4" />
              New appointment
            </Link>
          </Button>
        </div>

        <ScheduleSection
          title="Upcoming"
          eyebrow="Next"
          rooms={upcoming}
          isLoading={loadingUpcoming}
          emptyMessage="No upcoming appointments."
        />
        <ScheduleSection
          title="Past appointments"
          eyebrow="History"
          rooms={past}
          isLoading={loadingPast}
          emptyMessage="No past appointments yet."
        />
      </main>
      <Footer />
    </>
  );
}

const ScheduleSection = ({
  title,
  eyebrow,
  rooms,
  isLoading,
  emptyMessage,
}: {
  title: string;
  eyebrow: string;
  rooms?: Room[];
  isLoading: boolean;
  emptyMessage: string;
}) => (
  <section className="mb-12" aria-labelledby={`schedule-${eyebrow}`}>
    <div className="mb-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 id={`schedule-${eyebrow}`} className="text-xl font-bold">
        {title}
      </h2>
    </div>
    <div className="space-y-4">
      {isLoading ? (
        <>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </>
      ) : rooms?.length ? (
        rooms.map((room) => <UpcomingSession data={room} key={room.id} />)
      ) : (
        <Card className="flex min-h-36 items-center justify-center border-dashed p-8 text-center text-sm text-muted-foreground">
          <div>
            <CalendarX2 className="mx-auto mb-3 h-5 w-5 text-primary" />
            {emptyMessage}
          </div>
        </Card>
      )}
    </div>
  </section>
);
