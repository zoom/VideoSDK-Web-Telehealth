import { type MutableRefObject, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { RecordingStatus } from "@zoom/videosdk";
import type { RecordingClient, VideoClient } from "@zoom/videosdk";
import { CircleDotIcon, CircleSlash2 } from "lucide-react";

const RecordingButton = (props: { client: MutableRefObject<typeof VideoClient> }) => {
  const { client } = props;
  const [isRecording, setIsRecording] = useState(RecordingStatus.Stopped);
  const recordingClient = useRef<typeof RecordingClient>(client.current.getRecordingClient());

  const onRecordingClick = async () => {
    if (recordingClient.current === undefined) return;
    if (recordingClient.current?.getCloudRecordingStatus() === RecordingStatus.Recording) {
      await recordingClient.current.stopCloudRecording();
    } else {
      await recordingClient.current.startCloudRecording();
    }
    setIsRecording(recordingClient.current.getCloudRecordingStatus());
  };

  return (
    <Button onClick={onRecordingClick} variant={isRecording === RecordingStatus.Recording ? "destructive" : "outline"} title="recording">
      {isRecording === RecordingStatus.Recording ? <CircleSlash2 /> : <CircleDotIcon />}
    </Button>
  );
};

export default RecordingButton;
