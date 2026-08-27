import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { RecordingStatus } from "@zoom/videosdk";
import { CircleDotIcon, CircleSlash2 } from "lucide-react";
import { getZoomClient } from "~/lib/zoom-video";

const RecordingButton = () => {
  const client = getZoomClient();
  const recordingClient = client.getRecordingClient();
  const [recordingStatus, setRecordingStatus] = useState(() => recordingClient.getCloudRecordingStatus());

  useEffect(() => {
    const handleRecordingChange = ({ state }: { state: RecordingStatus }) => {
      setRecordingStatus(state);
    };
    client.on("recording-change", handleRecordingChange);
    return () => {
      client.off("recording-change", handleRecordingChange);
    };
  }, [client]);

  const onRecordingClick = async () => {
    if (recordingStatus === RecordingStatus.Recording) {
      await recordingClient.stopCloudRecording();
    } else {
      await recordingClient.startCloudRecording();
    }
  };

  return (
    <Button onClick={onRecordingClick} variant={recordingStatus === RecordingStatus.Recording ? "destructive" : "outline"} title="recording">
      {recordingStatus === RecordingStatus.Recording ? <CircleSlash2 /> : <CircleDotIcon />}
    </Button>
  );
};

export default RecordingButton;
