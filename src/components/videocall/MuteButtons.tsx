import { type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import type { VideoClient } from "@zoom/videosdk";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const MicButton = ({ client, isAudioMuted, setIsAudioMuted } : { 
    client: MutableRefObject<typeof VideoClient>; 
    isAudioMuted: boolean; 
    setIsAudioMuted: Dispatch<SetStateAction<boolean>>;
  }) => {

  //needed because .startAudio() is somehow setting isAudioMuted to false on join audio. This 
  //prevent the MicOff icon from showing if audio is muted when a user joins
  setIsAudioMuted(client?.current?.getCurrentUserInfo()?.muted ?? true);
 
  const onMicrophoneClick = async () => {
    const mediaStream = client.current.getMediaStream();
    isAudioMuted ? await mediaStream?.unmuteAudio() : await mediaStream?.muteAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo().muted ?? true);
  };
  return (
    <Button onClick={onMicrophoneClick} variant={"outline"} title="microphone">
      {isAudioMuted ? <MicOff /> : <Mic />}
    </Button>
  );
};

const CameraButton = ({ client, isVideoMuted, setIsVideoMuted, renderVideo, currentBackground}: {
  client: MutableRefObject<typeof VideoClient>;
  isVideoMuted: boolean;
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>;
  renderVideo: (event: { action: "Start" | "Stop"; userId: number }) => Promise<void>;
  currentBackground: string;
}) => {
  const onCameraClick = async () => {
    const mediaStream = client.current.getMediaStream();
    if (isVideoMuted) {
      await mediaStream.startVideo({ virtualBackground: { imageUrl: currentBackground } });
      setIsVideoMuted(false);
      await renderVideo({ action: "Start", userId: client.current.getCurrentUserInfo().userId });
    } else {
      await mediaStream.stopVideo();
      setIsVideoMuted(true);
      await renderVideo({ action: "Stop", userId: client.current.getCurrentUserInfo().userId });
    }
  };

  return (
    <Button onClick={onCameraClick} variant={"outline"} title="camera">
      {isVideoMuted ? <VideoOff /> : <Video />}
    </Button>
  );
};

export { MicButton, CameraButton };
