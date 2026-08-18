import { type RefObject, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import type { VideoClient } from "@zoom/videosdk";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useToast } from "~/components/ui/use-toast";

const getDeviceError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
  ) {
    return error.reason;
  }
  return "Check your browser permissions and try again.";
};

const MicButton = ({ client, isAudioMuted, setIsAudioMuted }: {
  client: RefObject<typeof VideoClient>;
  isAudioMuted: boolean;
  setIsAudioMuted: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const { toast } = useToast();

  const onMicrophoneClick = async () => {
    setIsChanging(true);
    try {
      const mediaStream = client.current.getMediaStream();
      if (isAudioMuted) {
        await mediaStream.unmuteAudio();
      } else {
        await mediaStream.muteAudio();
      }
      setIsAudioMuted(client.current.getCurrentUserInfo()?.muted ?? true);
    } catch (error) {
      toast({
        title: "Could not change microphone",
        description: getDeviceError(error),
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };
  return (
    <Button
      onClick={() => void onMicrophoneClick()}
      variant="outline"
      title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
      disabled={isChanging}
    >
      {isChanging ? <Loader2 className="animate-spin" /> : isAudioMuted ? <MicOff /> : <Mic />}
    </Button>
  );
};

const CameraButton = ({ client, isVideoMuted, setIsVideoMuted, renderVideo, currentBackground }: {
  client: RefObject<typeof VideoClient>;
  isVideoMuted: boolean;
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>;
  renderVideo: (event: { action: "Start" | "Stop"; userId: number }) => Promise<void>;
  currentBackground: string;
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const { toast } = useToast();

  const onCameraClick = async () => {
    setIsChanging(true);
    try {
      const mediaStream = client.current.getMediaStream();
      const currentUser = client.current.getCurrentUserInfo();
      if (!currentUser) throw new Error("The call is not connected yet.");

      if (isVideoMuted) {
        await mediaStream.startVideo(
          currentBackground
            ? { virtualBackground: { imageUrl: currentBackground } }
            : undefined,
        );
        await renderVideo({ action: "Start", userId: currentUser.userId });
        setIsVideoMuted(false);
      } else {
        await mediaStream.stopVideo();
        await renderVideo({ action: "Stop", userId: currentUser.userId });
        setIsVideoMuted(true);
      }
    } catch (error) {
      toast({
        title: "Could not change camera",
        description: getDeviceError(error),
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Button
      onClick={() => void onCameraClick()}
      variant="outline"
      title={isVideoMuted ? "Turn camera on" : "Turn camera off"}
      disabled={isChanging}
    >
      {isChanging ? <Loader2 className="animate-spin" /> : isVideoMuted ? <VideoOff /> : <Video />}
    </Button>
  );
};

export { MicButton, CameraButton };
