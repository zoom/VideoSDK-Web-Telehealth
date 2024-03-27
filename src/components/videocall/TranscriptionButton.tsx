import { type Dispatch, type MutableRefObject, type SetStateAction, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import type { LiveTranscriptionClient, LiveTranscriptionMessage, VideoClient } from "@zoom/videosdk";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { LucideNotebookText, LucideSplitSquareHorizontal, NotebookPen } from "lucide-react";

const TranscriptionButton = (props: {
  setTranscriptionSubtitle: Dispatch<
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
  client: MutableRefObject<typeof VideoClient>;
}) => {
  const { setTranscriptionSubtitle, client } = props;
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const transcriptionClient = useRef<typeof LiveTranscriptionClient>(client.current.getLiveTranscriptionClient());
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
      client.current.on(`caption-message`, handleCaptions);
      await transcriptionClient.current.startLiveTranscription();
      setIsStartedLiveTranscription(true);
    }
  };

  return (
    <Button onClick={onTranscriptionClick} variant={isStartedLiveTranscription ? "default" : "outline"}>
      {isStartedLiveTranscription ? <LucideSplitSquareHorizontal /> : <LucideNotebookText />}
    </Button>
  );
};
export default TranscriptionButton;
