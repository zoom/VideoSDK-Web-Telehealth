import { type TranscriptEleType } from "~/components/videocall/Transcript";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { LinkIcon } from "lucide-react";
import { useState, useRef } from "react";
import ConfidentialDialog from "~/components/ui/ConfidentialDialog";
import RightBar from "~/components/videocall/RightBar";
import ZoomVideo from "@zoom/videosdk";
import Videocall from "~/components/videocall/Videocall";
import { type ChatRecord } from "~/components/chat/Chat";

const Home = () => {
  const [inCall, setInCall] = useState(false);
  const router = useRouter();
  const { data, isLoading, isError, error } = api.room.getById.useQuery(
    { id: `${router.query.slug as string}` },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false }
  );
  const { toast } = useToast();
  const { data: userData } = useSession();
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState<TranscriptEleType>({});
  const client = useRef(ZoomVideo.createClient());

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Error: {error.message}</h1>
      </div>
    );
  }

  const copyLink = async () => {
    const link = `${window.location.toString()}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Copied link to clipoard", description: link });
  };

  if (!isLoading && data) {
    return (
      <>
        <div className="relative m-0 flex min-h-screen w-full flex-1 flex-col self-center bg-gray-100 px-0 pb-8">
          <div className="mx-16 mt-4 flex flex-row bg-white ">
            <div className="flex flex-1 flex-col rounded-l-md p-3">
              <span className="inline-flex">
                <Button variant={"link"} className="flex" onClick={copyLink}>
                  <h1 className="text-left text-3xl font-bold text-gray-700">{data.room.title}</h1>
                  <LinkIcon height={24} className="ml-2 text-gray-700" strokeWidth={3} />
                </Button>
              </span>
              <span className="inline-flex">
                <p className="ml-4 text-left text-lg text-gray-700">{data.room.content}</p>
                <p className="ml-4 text-left text-lg text-gray-700">| {new Date(data.room.time).toTimeString().split(" ")[0]}</p>
              </span>
            </div>
            <div className="h-full justify-center self-center rounded-r-md p-4">
              <RightBar data={data} transcriptionSubtitle={transcriptionSubtitle} client={client} records={records} inCall={inCall} />
            </div>
          </div>
          <Videocall
            jwt={data.jwt}
            session={data.room.id}
            client={client}
            setRecords={setRecords}
            isCreator={data.room.User_CreatedBy.id === userData?.user.id}
            setTranscriptionSubtitle={setTranscriptionSubtitle}
            inCall={inCall}
            setInCall={setInCall}
          />
        </div>
        <ConfidentialDialog />
      </>
    );
  }
};

export default Home;
