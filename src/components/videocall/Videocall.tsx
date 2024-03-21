import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "../ui/use-toast";
import { LinkIcon } from "lucide-react";
import { api } from "~/utils/api";
import { WorkAroundForSafari } from "~/utils/safari";
import ZoomVideo, { VideoQuality, type VideoPlayer } from "@zoom/videosdk";
import SettingsModal from "./SettingsModal";
import ActionModal from "./ActionModal";
import Transcipt, { type TranscriptEleType } from "./Transcript";
import UIToolKit from "./UIToolKit";
import TranscriptionButton from "./TranscriptionButton";
import RecordingButton from "./RecordingButton";
import { CameraButton, MicButton } from "./MuteButtons";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const Videocall = (props: { jwt: string; session: string; isCreator: boolean }) => {
  const router = useRouter();
  const { data } = useSession();
  const { toast } = useToast();
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const client = useRef(ZoomVideo.createClient());
  const [incall, setIncall] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(!client.current.getCurrentUserInfo()?.bVideoOn);
  const [isAudioMuted, setIsAudioMuted] = useState(client.current.getCurrentUserInfo()?.muted ?? true);
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState<TranscriptEleType>({});

  const init = async () => {
    await client.current.init("en-US", "Global", { patchJsMedia: true });
    client.current.on("peer-video-state-change", (payload) => void renderVideo(payload));
    await client.current.join(props.session, props.jwt, data?.user.name ?? "User").catch((e) => {
      console.log(e);
    });
    if (props.isCreator) {
      await writeZoomSessionID.mutateAsync({ zoomSessionsId: client.current.getSessionInfo().sessionId, roomId: props.session });
    }
  };

  const renderVideo = async (event: { action: "Start" | "Stop"; userId: number }) => {
    const mediaStream = client.current.getMediaStream();
    if (event.action === "Stop") {
      const element = await mediaStream.detachVideo(event.userId);
      Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    } else {
      const userVideo = await mediaStream.attachVideo(event.userId, VideoQuality.Video_360P);
      videoContainerRef.current!.appendChild(userVideo as VideoPlayer);
    }
  };

  const startCall = async () => {
    toast({ title: "Joining", description: "Please wait..." });
    await init();
    setIncall(true);
    const mediaStream = client.current.getMediaStream();
    // @ts-expect-error https://stackoverflow.com/questions/7944460/detect-safari-browser/42189492#42189492
    window.safari ? await WorkAroundForSafari(client.current) : await mediaStream.startAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo().muted ?? true);
    await mediaStream.startVideo();
    setIsVideoMuted(!client.current.getCurrentUserInfo().bVideoOn);
    await renderVideo({ action: "Start", userId: client.current.getCurrentUserInfo().userId });
  };

  // not sure about this yet
  const leaveCall = async () => {
    toast({ title: "Leaving", description: "Please wait..." });
    client.current.off("peer-video-state-change", () => void renderVideo);
    await client.current.leave().catch((e) => console.log("leave error", e));
    setIncall(false);
    await router.push("/", undefined, { shallow: false });
  };

  //create menu button to include access to previous recordings
  return (
    <>
      <div id="meeting" className={incall ? "mb-8 mt-8 flex flex-1" : "hidden"} />
      <div className="flex h-full w-full flex-1 flex-col p-8">
        {/* @ts-expect-error html component */}
        <video-player-container ref={videoContainerRef}></video-player-container>
        {!incall ? (
          <>
            <div className="mx-auto flex w-64 self-center">
              <UIToolKit />
              <Button className="flex flex-1" onClick={startCall}>
                Join
              </Button>
              <div className="w-4"></div>
              <Button
                variant={"outline"}
                className="flex flex-1"
                onClick={async () => {
                  const link = `${window.location.toString()}`;
                  await navigator.clipboard.writeText(link);
                  toast({ title: "Copied link to clipoard", description: link });
                }}
              >
                Copy Link
                <LinkIcon height={16} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-1 flex-col justify-around self-center">
            <div className="mt-8 flex w-[50%] flex-1 justify-around self-center">
              <CameraButton client={client} isVideoMuted={isVideoMuted} setIsVideoMuted={setIsVideoMuted} renderVideo={renderVideo} />
              <MicButton isAudioMuted={isAudioMuted} client={client} setIsAudioMuted={setIsAudioMuted} />
              <TranscriptionButton setTranscriptionSubtitle={setTranscriptionSubtitle} client={client} />
              <RecordingButton client={client} />
              <Button variant={"outline"} onClick={leaveCall}>
                Leave
              </Button>
            </div>
            <Transcipt transcriptionSubtitle={transcriptionSubtitle} />
          </div>
        )}
      </div>
      <br />
      {incall ? <ActionModal client={client} /> : <></>}
      {incall ? <SettingsModal client={client} /> : <></>}
    </>
  );
};

export default Videocall;
