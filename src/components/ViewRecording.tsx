"use client";

import { AlertCircle, ExternalLink, Video } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

export function ViewRecording({ roomId }: { roomId: string }) {
  const { isLoading, data, error } = api.zoom.getAllRecordings.useQuery(
    { roomId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      retry: false,
    },
  );

  if (isLoading) {
    return (
      <Card className="space-y-3 p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex items-start gap-4 border-destructive/20 bg-destructive/5 p-6">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold">Recordings unavailable</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {error.message}
          </p>
        </div>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="flex min-h-44 items-center justify-center border-dashed p-8 text-center">
        <div>
          <Video className="mx-auto mb-3 h-6 w-6 text-primary" />
          <h2 className="font-semibold">No recordings yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed cloud recordings will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((recording) => (
        <Card key={recording.session_id} className="p-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {new Date(recording.start_time).toLocaleDateString(undefined, {
              dateStyle: "long",
            })}
          </p>
          <div className="mt-3 divide-y">
            {recording.recording_files?.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {file.recording_type?.replaceAll("_", " ") ??
                      `${file.file_type} recording`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(file.recording_start).toLocaleTimeString(
                      undefined,
                      { hour: "numeric", minute: "2-digit" },
                    )}{" "}
                    –{" "}
                    {new Date(file.recording_end).toLocaleTimeString(
                      undefined,
                      { hour: "numeric", minute: "2-digit" },
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={file.download_url} target="_blank">
                    Open recording
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
