"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  Loader2,
  Video,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { MeetingWithLabel } from "~/components/UpcomingSession";
import { ViewNotes } from "~/components/ViewNotes";
import { ViewRecording } from "~/components/ViewRecording";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

export default function AppointmentDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, error } = api.room.getById.useQuery(
    { id: slug },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );
  const { toast } = useToast();
  const { data: userData } = useSession();
  const [now] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Appointment unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message}
          </p>
        </div>
      </div>
    );
  }

  const startsAt = new Date(data.room.time);
  const isDoctor = userData?.user.role === "doctor";

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/room/${data.room.id}`,
    );
    toast({ title: "Appointment link copied" });
  };

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/schedule"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Schedule
        </Link>

        <Card className="overflow-hidden">
          <div className="border-b bg-accent/45 p-6 sm:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Appointment details
            </p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {data.room.title}
                </h1>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {startsAt.toLocaleDateString(undefined, {
                      dateStyle: "long",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    {startsAt.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {data.room.duration}{" "}
                    {data.room.duration === 1 ? "hour" : "hours"}
                  </span>
                </div>
                <div className="mt-3">
                  <MeetingWithLabel roomData={data.room} />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" onClick={() => void copyLink()}>
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
                {startsAt.getTime() > now && (
                  <Button asChild>
                    <Link href={`/room/${data.room.id}`}>
                      <Video className="h-4 w-4" />
                      Join
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-semibold">Care context</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {data.room.content}
            </p>
          </div>
        </Card>

        <div className="mt-8 space-y-8">
          {isDoctor && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Visit notes</h2>
              <ViewNotes roomId={data.room.id} dontShowAdd />
            </section>
          )}
          <section>
            <h2 className="mb-3 text-lg font-bold">Recordings</h2>
            <ViewRecording roomId={data.room.id} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
