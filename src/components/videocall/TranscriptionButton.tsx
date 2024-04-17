import { Button } from "~/components/ui/button";
import { type Dispatch, type MutableRefObject, type SetStateAction, useRef, useState } from "react";
import type { LiveTranscriptionClient, LiveTranscriptionMessage, VideoClient } from "@zoom/videosdk";
import { MessageCircleMore, MessageCircleOff } from "lucide-react";
import { useToast } from "../ui/use-toast";

const TranscriptionButton = (props: { setTranscriptionSubtitle: setTranscriptionSubtitle; client: MutableRefObject<typeof VideoClient> }) => {
  const { setTranscriptionSubtitle, client } = props;
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const transcriptionClient = useRef<typeof LiveTranscriptionClient>(client.current.getLiveTranscriptionClient());
  const { toast } = useToast();

  const onTranscriptionClick = async () => {
    const handleCaptions = (payload: LiveTranscriptionMessage) => {
      setTranscriptionSubtitle(
        (prev) =>
          (prev = {
            ...prev,
            [payload.msgId]: { name: payload.displayName, text: payload.text, isSelf: payload.userId === client.current.getCurrentUserInfo().userId },
          })
      );
    };

    if (transcriptionClient.current === undefined) return;

    if (isStartedLiveTranscription) {
      client.current.off(`caption-message`, handleCaptions);
      await transcriptionClient.current.disableCaptions(true);
      setIsStartedLiveTranscription(false);
    } else {
      toast({ title: "Starting live transcription", description: "You can view them in the top right menu" });
      client.current.on(`caption-message`, handleCaptions);
      await transcriptionClient.current.startLiveTranscription();
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
