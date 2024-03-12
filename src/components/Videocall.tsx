import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
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
  type VideoClient,
} from "@zoom/videosdk";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import Link from "next/link";
import { Upload } from "lucide-react";
import RecordingModal from "./RecordingModal";

const Videocall = (props: { jwt: string; session: string; isCreator: boolean }) => {
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
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

  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      isRender.current = 1;
    }
  }, []);

  const init = async () => {
    await client.current.init("en-US", "CDN", {enforceMultipleVideos: true});
    try {
      await client.current.join(props.session, props.jwt, data?.user.name ?? "User").catch((e) => {
        console.log(e);
      });
      if (props.isCreator) {
        await writeZoomSessionID.mutateAsync({ zoomSessionsId: client.current.getSessionInfo().sessionId, roomId: props.session });
      }
    } catch (e) {
      console.log(e);
    }
    recordingClient.current = client.current.getRecordingClient();
    transcriptionClient.current = client.current.getLiveTranscriptionClient();
    console.log("recording status", isRecording);
    client.current.on('peer-video-state-change', renderVideo)
  };
  const renderVideo = async() => {
    console.log('RENDERING VIDEO')
    const mediaStream = client.current.getMediaStream();
    console.log('multiple', mediaStream.isSupportMultipleVideos())
    for (const user of client.current.getAllUser()) {
      if (user.bVideoOn) {
        const userVideo = await mediaStream.attachVideo(user.userId, 1);
        if (userVideo) document.querySelector("video-player-container")?.appendChild(userVideo as VideoPlayer);
      }
    }
  }
  const startCall = async () => {
    toast({ title: "Joining", description: "Please wait..." });
    await init();
    uitoolkit.closePreview(previewContainer.current!);
    renderVideo();
    setIncall(true);
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
      await mediaStream.stopRenderVideo('video-player-container', user.userId);
      setVideoStarted(false);
    } else {
      await mediaStream.startVideo().then(() => {
        renderVideo();
      });
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
      {incall && <ActionModal client={client} />}
      {incall && <SettingsModal client={client} />}
    </>
  );
};

const ActionModal = (props: { client: MutableRefObject<typeof VideoClient> }) => {
  const { toast } = useToast();
  const { client } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Action Menu</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize As You See Fit</DialogTitle>
        </DialogHeader>
        <RecordingModal roomId={client.current.getSessionInfo().topic} buttonVariant="default" />
        <p>{client.current.getSessionInfo().topic}</p>
        <Button
          variant={"outline"}
          className="flex flex-1"
          onClick={async () => {
            const link = `${window.location.toString()}`;
            await navigator.clipboard.writeText(link);
            toast({ title: "Copied link to clipoard", description: link });
          }}
        >
          Invite Others
          <LinkIcon height={16} />
        </Button>
        <Link href={"/upload"} className="m-2 flex flex-row justify-around">
          <Button>
            <Upload size={18} className="mr-2" />
            Upload Document
          </Button>
        </Link>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SettingsModal = (props: { client: MutableRefObject<typeof VideoClient> }) => {
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

  const setCameraDevice = async (camera: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchCamera(camera.deviceId);
    }
  };

  const setMicDevice = async (mic: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchMicrophone(mic.deviceId);
    }
  };

  const setSpeakerDevice = async (speaker: device) => {
    const mediaStream = props.client.current.getMediaStream();
    if (mediaStream) {
      await mediaStream.switchSpeaker(speaker.deviceId);
    }
  };

  console.log("camera", micList);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">SettingsModal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Preferred Device</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="t1" className="mt-2 flex w-full flex-col self-center">
          <TabsList>
            <TabsTrigger value="t1">Camera Settings</TabsTrigger>
            <TabsTrigger value="t2">Audio Settings</TabsTrigger>
            <TabsTrigger value="t3">Speaker Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">
            <RadioGroup className="my-4 flex flex-row">
              {cameraList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setCameraDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          <TabsContent value="t2">
            <RadioGroup className="my-4 flex flex-row">
              {micList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setMicDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          <TabsContent value="t3">
            <RadioGroup className="my-4 flex flex-row">
              {speakerList?.map((device) => (
                <div className="flex items-center space-x-2" key={device.deviceId}>
                  <RadioGroupItem value={device.label} id={device.deviceId} onClick={() => setSpeakerDevice(device)} />
                  <Label htmlFor={device.deviceId}>{device.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
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
