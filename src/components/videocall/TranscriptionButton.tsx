import { Button } from "~/components/ui/button";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";
import type { LiveTranscriptionMessage } from "@zoom/videosdk";
import { MessageCircleMore, MessageCircleOff } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { getZoomClient } from "~/lib/zoom-video";

const TranscriptionButton = (props: { setTranscriptionSubtitle: setTranscriptionSubtitle }) => {
  const { setTranscriptionSubtitle } = props;
  const client = getZoomClient();
  const transcriptionClient = client.getLiveTranscriptionClient();
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(
    () => transcriptionClient.getLiveTranscriptionStatus().isLiveTranscriptionEnabled
  );
  const { toast } = useToast();

  const handleCaptions = useCallback(
    (payload: LiveTranscriptionMessage) => {
      setTranscriptionSubtitle((previous) => ({
        ...previous,
        [payload.msgId]: {
          name: payload.displayName,
          text: payload.text,
          isSelf: payload.userId === client.getCurrentUserInfo().userId,
        },
      }));
    },
    [client, setTranscriptionSubtitle]
  );

  useEffect(() => {
    const handleStatus = ({ autoCaption }: { autoCaption: boolean }) => {
      setIsStartedLiveTranscription(autoCaption);
    };
    client.on("caption-message", handleCaptions);
    client.on("caption-status", handleStatus);
    return () => {
      client.off("caption-message", handleCaptions);
      client.off("caption-status", handleStatus);
    };
  }, [client, handleCaptions]);

  const onTranscriptionClick = async () => {
    if (isStartedLiveTranscription) {
      await transcriptionClient.disableCaptions(true);
      setIsStartedLiveTranscription(false);
    } else {
      toast({ title: "Starting live transcription", description: "You can view them in the top right menu" });
      await transcriptionClient.startLiveTranscription();
      setIsStartedLiveTranscription(true);
    }
  };

  return (
    <Button onClick={onTranscriptionClick} variant={isStartedLiveTranscription ? "default" : "outline"} title="transcription">
      {isStartedLiveTranscription ? <MessageCircleOff /> : <MessageCircleMore />}
    </Button>
  );
};
export default TranscriptionButton;

type setTranscriptionSubtitle = Dispatch<
  SetStateAction<
    Record<
      string,
      {
        name: string;
        text: string;
        isSelf: boolean;
      }
    >
  >
>;
