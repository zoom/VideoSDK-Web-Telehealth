import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useAudioState, useVideoState } from "@zoom/videosdk-react";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useToast } from "~/components/ui/use-toast";

const getDeviceError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
    return error.reason;
  }
  return "Check your browser permissions and try again.";
};

const MicButton = () => {
  const [isChanging, setIsChanging] = useState(false);
  const { isAudioMuted, toggleMute } = useAudioState();
  const { toast } = useToast();

  const onMicrophoneClick = async () => {
    setIsChanging(true);
    try {
      await toggleMute();
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
    <Button onClick={() => void onMicrophoneClick()} variant="outline" title={isAudioMuted ? "Unmute microphone" : "Mute microphone"} disabled={isChanging}>
      {isChanging ? <Loader2 className="animate-spin" /> : isAudioMuted ? <MicOff /> : <Mic />}
    </Button>
  );
};

const CameraButton = ({ currentBackground }: { currentBackground: string }) => {
  const [isChanging, setIsChanging] = useState(false);
  const { isVideoOn, toggleVideo } = useVideoState();
  const { toast } = useToast();

  const onCameraClick = async () => {
    setIsChanging(true);
    try {
      await toggleVideo(currentBackground ? { virtualBackground: { imageUrl: currentBackground } } : undefined);
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
    <Button onClick={() => void onCameraClick()} variant="outline" title={isVideoOn ? "Turn camera off" : "Turn camera on"} disabled={isChanging}>
      {isChanging ? <Loader2 className="animate-spin" /> : isVideoOn ? <Video /> : <VideoOff />}
    </Button>
  );
};

export { MicButton, CameraButton };
