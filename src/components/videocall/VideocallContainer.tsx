import ZoomVideo from "@zoom/videosdk";
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

import { type ChatRecord } from "~/components/chat/Chat";
import ConfidentialDialog from "~/components/ui/ConfidentialDialog";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import RightBar from "./RightBar";
import { type TranscriptEleType } from "./Transcript";
import Videocall from "./Videocall";

const VideocallContainer = () => {
  const [inCall, setInCall] = useState(false);
  const [copied, setCopied] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, error } = api.room.getById.useQuery(
    { id: slug },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );
  const { toast } = useToast();
  const { data: userData } = useSession();
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [transcriptionSubtitle, setTranscriptionSubtitle] =
    useState<TranscriptEleType>({});
  const [zoomClient] = useState(() => ZoomVideo.createClient());
  const client = useRef(zoomClient);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing your appointment…
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Appointment unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "This appointment could not be loaded."}
          </p>
          <Button asChild className="mt-5">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({ title: "Appointment link copied" });
    window.setTimeout(() => setCopied(false), 1600);
  };

  const startsAt = new Date(data.room.time);

  return (
    <>
      <main className="flex min-h-screen flex-col bg-[#f4f8f6]">
        <header className="border-b border-border/80 bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/" title="Return to dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      inCall ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {inCall ? "Connected" : "Pre-call check"}
                  </p>
                </div>
                <h1 className="truncate text-lg font-bold tracking-tight">
                  {data.room.title}
                </h1>
                <p className="truncate text-xs text-muted-foreground">
                  {startsAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  {startsAt.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {data.room.content ? ` · ${data.room.content}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-12 lg:pl-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void copyLink()}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Invite link"}
              </Button>
              <RightBar
                data={data}
                transcriptionSubtitle={transcriptionSubtitle}
                client={client}
                records={records}
                inCall={inCall}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center py-8">
          <Videocall
            jwt={data.jwt}
            session={data.room.id}
            client={client}
            setRecords={setRecords}
            isCreator={
              data.room.User_CreatedBy.id === userData?.user.id
            }
            setTranscriptionSubtitle={setTranscriptionSubtitle}
            inCall={inCall}
            setInCall={setInCall}
          />
        </div>
      </main>
      <ConfidentialDialog />
    </>
  );
};

export default VideocallContainer;
