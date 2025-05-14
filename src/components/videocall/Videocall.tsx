import { useSession } from "next-auth/react";
import { type MutableRefObject, useState } from "react";
import { type VideoClient, VideoQuality, type VideoPlayer, type ChatMessage, type Participant } from "@zoom/videosdk";
import { PhoneOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { type ChatRecord } from "~/components/chat/Chat";
import { api } from "~/utils/api";
import { WorkAroundForSafari } from "~/utils/safari";
import { videoCallStyle } from "~/lib/utils";
import SettingsModal from "./SettingsModal";
import ActionModal from "./ActionModal";
import { type setTranscriptionType } from "./Transcript";
import TranscriptionButton from "./TranscriptionButton";
import RecordingButton from "./RecordingButton";
import { CameraButton, MicButton } from "./MuteButtons";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import Preview from "./Preview";

const Videocall = (props: VideoCallProps) => {
  const { setTranscriptionSubtitle, isCreator, jwt, session, client, inCall, setInCall } = props;
  const [isVideoMuted, setIsVideoMuted] = useState(!client.current.getCurrentUserInfo()?.bVideoOn);
  const [isAudioMuted, setIsAudioMuted] = useState(client.current.getCurrentUserInfo()?.muted ?? true);
  const [currentBackground, setCurrentBackground] = useState<string>('');
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
  const { data } = useSession();
  const { toast } = useToast();

  const init = async () => {
    await client.current.init("en-US", "Global", { patchJsMedia: true });
  };

  const startCall = async () => {
    toast({ title: "Joining", description: "Please wait..." });
    client.current.on("peer-video-state-change", (payload) => void renderVideo(payload));
    client.current.on("chat-on-message", onChatMessage);
    await client.current.join(session, jwt, data?.user.name ?? "User").catch((e) => {
      console.log(e);
    });
    setInCall(true);
    const mediaStream = client.current.getMediaStream();
    // @ts-expect-error https://stackoverflow.com/questions/7944460/detect-safari-browser/42189492#42189492
    window.safari ? await WorkAroundForSafari(client.current) : await mediaStream.startAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo().muted ?? true);

    if (isAudioMuted) await mediaStream.muteAudio();
    if (!isVideoMuted) {
      await mediaStream.startVideo({ virtualBackground: { imageUrl: currentBackground } });
      setIsVideoMuted(!client.current.getCurrentUserInfo().bVideoOn);
    }

    const users: Participant[] = client.current.getAllUser();
    for (const user of users) {
      if (user.bVideoOn) await renderVideo({ action: "Start", userId: user.userId });
    };
    if (isCreator && client.current.getSessionInfo().sessionId) {
      await writeZoomSessionID.mutateAsync({ zoomSessionsId: client.current.getSessionInfo().sessionId, roomId: session });
    }
  };

  const renderVideo = async (event: { action: "Start" | "Stop"; userId: number }) => {
    const mediaStream = client.current.getMediaStream();
    if (event.action === "Stop") {
      const element = await mediaStream.detachVideo(event.userId);
      Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    } else {
      const videoContainer = document.querySelector('video-player-container');
      console.log('from videocall', videoContainer)
      const userVideo = await mediaStream.attachVideo(event.userId, VideoQuality.Video_360P);
      // videoContainerRef.current!.appendChild(userVideo as VideoPlayer);
      if (videoContainer) videoContainer.appendChild(userVideo as VideoPlayer);
    }
  };

  const onChatMessage = (payload: ChatMessage) => {
    props.setRecords((previous) => [...previous, payload]);
    if (payload.sender.userId !== client.current.getCurrentUserInfo().userId) {
      toast({ title: `Chat from: ${payload.sender.name}`, description: payload.message, duration: 1000 });
    }
  };

  const leaveCall = async () => {
    toast({ title: "Leaving", description: "Please wait..." });
    client.current.off("peer-video-state-change", (payload: { action: "Start" | "Stop"; userId: number }) => void renderVideo(payload));
    client.current.off("chat-on-message", onChatMessage);
    await client.current.leave().catch((e) => console.log("leave error", e));
    window.location.href = "/";
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col rounded-md px-4">
      {!inCall ? (
        <div className="mx-auto flex w-64 flex-col self-center">
          <div className="w-4 h-8" />
          <Preview init={init}
            setIsVideoMuted={setIsVideoMuted}
            setIsAudioMuted={setIsAudioMuted}
            currentBackground={currentBackground}
            setCurrentBackground={setCurrentBackground} />
          <div className="w-4" />
          <Button className="flex flex-1" onClick={startCall}>
            Join
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex w-full flex-1" style={inCall ? {} : { display: "none" }}>
            {/* @ts-expect-error html component */}
            <video-player-container style={videoCallStyle} />
          </div>
          <div className="flex w-full flex-col justify-around self-center">
            <div className="mt-4 flex w-[30rem] flex-1 justify-around self-center rounded-md bg-white p-4">
              <CameraButton
                client={client}
                isVideoMuted={isVideoMuted}
                setIsVideoMuted={setIsVideoMuted}
                renderVideo={renderVideo}
                currentBackground={currentBackground} />

              <MicButton isAudioMuted={isAudioMuted} client={client} setIsAudioMuted={setIsAudioMuted} />
              <TranscriptionButton setTranscriptionSubtitle={setTranscriptionSubtitle} client={client} />
              <RecordingButton client={client} />
              <SettingsModal client={client} />
              <ActionModal />
              <Button variant={"destructive"} onClick={leaveCall} title="leave call">
                <PhoneOff />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type VideoCallProps = {
  jwt: string;
  session: string;
  isCreator: boolean;
  setTranscriptionSubtitle: setTranscriptionType;
  setRecords: React.Dispatch<React.SetStateAction<ChatRecord[]>>;
  client: MutableRefObject<typeof VideoClient>;
  inCall: boolean;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

export default Videocall;
