"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ViewRecording } from "~/components/ViewRecording";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";

export default function RecordingsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/roomInfo/${roomId}`}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Appointment
        </Link>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Visit media
        </p>
        <h1 className="mb-7 mt-2 text-3xl font-bold tracking-tight">
          Recordings
        </h1>
        <ViewRecording roomId={roomId} />
      </main>
      <Footer />
    </>
  );
}
