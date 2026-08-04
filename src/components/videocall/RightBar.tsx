import { type VideoClient } from "@zoom/videosdk";
import { FileText, MessageSquare, Subtitles, UserRound, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { type MutableRefObject, useState } from "react";

import { ViewNotes } from "~/components/ViewNotes";
import { ViewPatient } from "~/components/ViewPatient";
import Chat, { type ChatRecord } from "~/components/chat/Chat";
import { Button } from "~/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { type RouterOutputs } from "~/utils/api";
import Transcipt, { type TranscriptEleType } from "./Transcript";

const RightBar = ({
  transcriptionSubtitle,
  data,
  inCall,
  client,
  records,
}: RightBarProps) => {
  const { data: userData } = useSession();
  const [activeTab, setActiveTab] = useState("");
  const isDoctor = userData?.user.role === "doctor";
  const hasTranscript = Object.keys(transcriptionSubtitle).length > 0;

  if (!isDoctor && !inCall) return null;

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9 bg-muted/70">
          {isDoctor && (
            <>
              <TabsTrigger value="patient" title="Patient details">
                <UserRound className="h-4 w-4" />
                <span className="hidden xl:inline">Patient</span>
              </TabsTrigger>
              <TabsTrigger value="notes" title="Visit notes">
                <FileText className="h-4 w-4" />
                <span className="hidden xl:inline">Notes</span>
              </TabsTrigger>
            </>
          )}
          {hasTranscript && (
            <TabsTrigger value="transcript" title="Transcript">
              <Subtitles className="h-4 w-4" />
              <span className="hidden xl:inline">Transcript</span>
            </TabsTrigger>
          )}
          {inCall && (
            <TabsTrigger value="chat" title="Chat">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden xl:inline">Chat</span>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {activeTab && (
        <aside className="fixed inset-x-4 top-20 z-30 ml-auto max-h-[calc(100vh-6rem)] max-w-md overflow-auto rounded-2xl border bg-white p-4 shadow-2xl shadow-slate-950/15 sm:right-6 sm:left-auto sm:w-[28rem]">
          <div className="mb-3 flex items-center justify-between border-b pb-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Appointment workspace
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("")}
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {activeTab === "patient" && (
            <ViewPatient
              userId={data.room.User_CreatedFor[0]?.id ?? "0"}
            />
          )}
          {activeTab === "notes" && <ViewNotes roomId={data.room.id} />}
          {activeTab === "transcript" && (
            <Transcipt transcriptionSubtitle={transcriptionSubtitle} />
          )}
          {activeTab === "chat" && (
            <Chat client={client} records={records} />
          )}
        </aside>
      )}
    </>
  );
};

type RightBarProps = {
  transcriptionSubtitle: TranscriptEleType;
  data: RouterOutputs["room"]["getById"];
  client: MutableRefObject<typeof VideoClient>;
  records: ChatRecord[];
  inCall: boolean;
};

export default RightBar;
