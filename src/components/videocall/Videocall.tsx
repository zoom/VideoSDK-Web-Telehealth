import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "../ui/use-toast";
import { PhoneOff } from "lucide-react";
import { api } from "~/utils/api";
import { WorkAroundForSafari } from "~/utils/safari";
import ZoomVideo, { VideoQuality, type VideoPlayer } from "@zoom/videosdk";
import SettingsModal from "./SettingsModal";
import ActionModal from "./ActionModal";
import { type setTranscriptionType } from "./Transcript";
import UIToolKit from "./UIToolKit";
import TranscriptionButton from "./TranscriptionButton";
import RecordingButton from "./RecordingButton";
import { CameraButton, MicButton } from "./MuteButtons";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { videoCallStyle } from "~/lib/utils";
// import Chat from "./Chat";

const Videocall = (props: { jwt: string; session: string; isCreator: boolean; setTranscriptionSubtitle: setTranscriptionType }) => {
  const { setTranscriptionSubtitle, isCreator, jwt, session } = props;
  const client = useRef(ZoomVideo.createClient());
  const [isVideoMuted, setIsVideoMuted] = useState(!client.current.getCurrentUserInfo()?.bVideoOn);
  const [isAudioMuted, setIsAudioMuted] = useState(client.current.getCurrentUserInfo()?.muted ?? true);
  const [incall, setIncall] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
  const router = useRouter();
  const { data } = useSession();
  const { toast } = useToast();

  const init = async () => {
    await client.current.init("en-US", "Global", { patchJsMedia: true });
    client.current.on("peer-video-state-change", (payload) => void renderVideo(payload));
    await client.current.join(session, jwt, data?.user.name ?? "User").catch((e) => {
      console.log(e);
    });
    if (isCreator) {
      await writeZoomSessionID.mutateAsync({ zoomSessionsId: client.current.getSessionInfo().sessionId, roomId: session });
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

  // not sure about this yet
  const leaveCall = async () => {
    toast({ title: "Leaving", description: "Please wait..." });
    client.current.off("peer-video-state-change", () => void renderVideo);
    await client.current.leave().catch((e) => console.log("leave error", e));
    setIncall(false);
    await router.push("/", undefined, { shallow: false });
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col rounded-md px-4">
      <div className="flex w-full flex-1" style={incall ? {} : { display: "none" }}>
        {/* @ts-expect-error html component */}
        <video-player-container ref={videoContainerRef} style={videoCallStyle} />
      </div>
      {!incall ? (
        <div className="mx-auto flex w-64 flex-col self-center">
          <UIToolKit />
          <div className="w-4" />
          <Button className="flex flex-1" onClick={startCall}>
            Join
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col justify-around self-center">
          <div className="mt-4 flex w-[30rem] flex-1 justify-around self-center rounded-md bg-white p-4">
            <CameraButton client={client} isVideoMuted={isVideoMuted} setIsVideoMuted={setIsVideoMuted} renderVideo={renderVideo} />
            <MicButton isAudioMuted={isAudioMuted} client={client} setIsAudioMuted={setIsAudioMuted} />
            <TranscriptionButton setTranscriptionSubtitle={setTranscriptionSubtitle} client={client} />
            <RecordingButton client={client} />
            <SettingsModal client={client} />
            {/* <Chat client={client}></Chat> */}
            <ActionModal />
            <Button variant={"destructive"} onClick={leaveCall}>
              <PhoneOff />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videocall;
