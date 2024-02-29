import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";
import ZoomVideo, {
  type VideoPlayer,
  RecordingStatus,
  type RecordingClient,
  type LiveTranscriptionClient,
  type LiveTranscriptionMessage,
} from "@zoom/videosdk";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const Videocall = (props: { jwt: string; session: string }) => {
  const isRender = useRef(0);
  const [incall, setIncall] = useState(false);
  const previewContainer = useRef<HTMLDivElement>(null);
  const sessionContainer = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const client = useRef(ZoomVideo.createClient());
  const transcriptionClient = useRef<typeof LiveTranscriptionClient>();
  const recordingClient = useRef<typeof RecordingClient>();
  const [videoStarted, setVideoStarted] = useState(client.current.getCurrentUserInfo()?.bVideoOn);
  const [audioStarted, setAudioStarted] = useState(client.current.getCurrentUserInfo() && client.current.getCurrentUserInfo().audio !== "");
  const [isMuted, setIsMuted] = useState(client.current.getCurrentUserInfo()?.muted);
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState("");
  const [isRecording, setIsRecording] = useState(RecordingStatus.Stopped);
  // const [receiveRecordings, setReceiveRecordings] = useState(false);

  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      isRender.current = 1;
    }
  }, []);

  const init = async () => {
    await client.current.init("en-US", "CDN");
    try {
      await client.current.join(props.session, props.jwt, data?.user.name ?? "User").catch((e) => {
        console.log(e);
      });
    } catch (e) {
      console.log(e);
    }
    recordingClient.current = client.current.getRecordingClient();
    transcriptionClient.current = client.current.getLiveTranscriptionClient();
    console.log("recording status", isRecording);
  };

  const startCall = async () => {
    setIncall(true);
    uitoolkit.closePreview(previewContainer.current!);
    await init();
  };

  const leaveCall = async () => {
    try {
      await client.current.leave(true);
    } catch (e) {}
    void router.push("/");
  };

  const onCameraClick = async () => {
    const mediaStream = client.current.getMediaStream();
    if (videoStarted) {
      await mediaStream.stopVideo();
      setVideoStarted(false);
    } else {
      await mediaStream.startVideo();
      for (const user of client.current.getAllUser()) {
        if (user.bVideoOn) {
          const userVideo = await mediaStream.attachVideo(user.userId, 3);
          if (userVideo) document.querySelector("video-player-container")?.appendChild(userVideo as VideoPlayer);
        }
      }
      setVideoStarted(true);
    }
  };

  const onMicrophoneClick = async () => {
    //adjust button to change wording with mute/unmute
    const mediaStream = client.current.getMediaStream();
    if (audioStarted) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
      } else {
        await mediaStream?.muteAudio();
      }
      setIsMuted(client.current.getCurrentUserInfo()?.muted);
    } else {
      await mediaStream?.startAudio();
      setAudioStarted(true);
    }
  };
  //create nice captions + disable button if audio is not started
  const onTranscriptionClick = async () => {
    const handleCaptions = (payload: LiveTranscriptionMessage) => {
      console.log(`${payload.displayName} said: ${payload.text}`);
      setTranscriptionSubtitle(payload.text);
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

  //create menu button to include access to previous recordings
  const onRecordingClick = async () => {
    if (recordingClient.current === undefined) return;
    // setIsRecording(recordingClient.current.getCloudRecordingStatus());
    if (recordingClient.current?.getCloudRecordingStatus() === RecordingStatus.Recording) {
      await recordingClient.current.stopCloudRecording();
      setIsRecording(recordingClient.current.getCloudRecordingStatus());
    } else {
      await recordingClient.current.startCloudRecording();
      setIsRecording(recordingClient.current.getCloudRecordingStatus());
    }
  };

  // const onReceiveRecordings = (data: any) => {
  //   const downloadLink = data.downloadLink;
  //   const session = data.sessionId;
  // };

  return (
    <>
      <div id="meeting" className={incall ? "mb-8 mt-8 flex flex-1" : "hidden"} ref={sessionContainer} />
      {!incall ? (
        <>
          <div id="preview" className="mb-8 mt-8 flex flex-1" ref={previewContainer} />
          <div className="mx-auto flex w-64 self-center">
            <Button className="flex flex-1" onClick={startCall}>
              Join
            </Button>
            <div className="w-4"></div>
            <Button
              variant={"outline"}
              className="flex flex-1"
              onClick={async () => {
                const link = `${window.location.toString()}`;
                await navigator.clipboard.writeText(link);
                toast({ title: "Copied link to clipoard", description: link });
              }}
            >
              Copy Link
              <LinkIcon height={16} />
            </Button>
          </div>
        </>
      ) : (
        <div>
          {/* @ts-expect-error html component */}
          <video-player-container></video-player-container>
          <Button onClick={onCameraClick}>{`${videoStarted ? "stop camera" : "start camera"}`}</Button>
          <Button onClick={onMicrophoneClick}>{`${audioStarted ? (isMuted ? "unMute" : "Mute") : "start audio"}`}</Button>
          <Button onClick={onTranscriptionClick}>{`${isStartedLiveTranscription ? "stop transcription" : "start transcription"}`}</Button>
          <Button onClick={onRecordingClick}>{`${isRecording === RecordingStatus.Recording ? "stop recording" : "start recording"}`}</Button>
          <p>{transcriptionSubtitle}</p>
        </div>
      )}
      <br />
      <SettingsModal />
    </>
  );
};

const SettingsModal = () => {
  const [cameraList, setCameraList] = useState<device[]>();
  const [micList, setMicList] = useState<device[]>();
  const [speakerList, setSpeakerList] = useState<device[]>();

  const getDevices = async () => {
    const allDevices = await ZoomVideo.getDevices();

    const cameraDevices = allDevices.filter((el) => {
      return el.kind === "videoinput";
    });
    const micDevices = allDevices.filter((el) => {
      return el.kind === "audioinput";
    });
    const speakerDevices = allDevices.filter((el) => {
      return el.kind === "audiooutput";
    });

    return {
      cameras: cameraDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
      mics: micDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
      speakers: speakerDevices.map((el) => {
        return { label: el.label, deviceId: el.deviceId };
      }),
    };
  };

  useEffect(() => {
    void getDevices().then((devices) => {
      setCameraList(devices.cameras);
      setMicList(devices.mics);
      setSpeakerList(devices.speakers);
    });
  }, []);

  console.log("camera", micList);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">SettingsModal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Heading</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="t1" className="mt-2 flex w-full flex-col self-center">
          <TabsList>
            <TabsTrigger value="t1">Camera Settings</TabsTrigger>
            <TabsTrigger value="t2">Audio Settings</TabsTrigger>
            <TabsTrigger value="t3">Speaker Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">
            {/* {cameraList?.map((camera) => {
              <p>{camera.label}</p>
            })} */}
            select camera
          </TabsContent>
          <TabsContent value="t2">Select Microphone</TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Videocall;

type device = {
  label: string;
  deviceId: string;
};
