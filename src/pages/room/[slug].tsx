import dynamic from "next/dynamic";
import { type setTranscriptionType, type TranscriptEleType } from "~/components/videocall/Transcript";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import ConfidentialDialog from "~/components/ui/ConfidentialDialog";
import RightBar from "~/components/videocall/RightBar";

const Videocall = dynamic<{ jwt: string; session: string; isCreator: boolean; setTranscriptionSubtitle: setTranscriptionType }>(
  () => import("../../components/videocall/Videocall"),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: userData } = useSession();
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState<TranscriptEleType>({});
  const { data, isLoading, isError, error } = api.room.getById.useQuery({ id: `${router.query.slug as string}` }, { retry: false });

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
        <div className="relative m-0 flex h-screen w-full flex-1 flex-col self-center overflow-y-scroll bg-gray-100 px-0 pb-8">
          <div className="mx-16 mt-4 flex flex-row">
            <div className="flex flex-1 flex-col rounded-l-md bg-white p-3">
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
            <div className=" h-full justify-center rounded-r-md bg-white p-4">
              <RightBar data={data} transcriptionSubtitle={transcriptionSubtitle}/>
            </div>
          </div>
          <Videocall
            jwt={data.jwt}
            session={data.room.id}
            isCreator={data.room.User_CreatedBy.id === userData?.user.id}
            setTranscriptionSubtitle={setTranscriptionSubtitle}
          />
        </div>
        <ConfidentialDialog />
      </>
    );
  }
}
