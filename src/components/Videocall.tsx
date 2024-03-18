import Link from "next/link";
import RecordingModal from "./RecordingModal";
import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";
import { WorkAroundForSafari } from "~/utils/safari";
import ZoomVideo, { RecordingStatus, VideoQuality } from "@zoom/videosdk";
import type { VideoPlayer, RecordingClient, LiveTranscriptionClient, LiveTranscriptionMessage, VideoClient } from "@zoom/videosdk";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const Videocall = (props: { jwt: string; session: string; isCreator: boolean }) => {
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
  const isRender = useRef(0);
  const [incall, setIncall] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const client = useRef(ZoomVideo.createClient());
  const transcriptionClient = useRef<typeof LiveTranscriptionClient>();
  const recordingClient = useRef<typeof RecordingClient>();
  const [isVideoMuted, setIsVideoMuted] = useState(!client.current.getCurrentUserInfo()?.bVideoOn);
  const [isAudioMuted, setIsAudioMuted] = useState(client.current.getCurrentUserInfo()?.muted);
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState<Record<string, { name: string; text: string; isSelf: boolean }>>({});
  const [isRecording, setIsRecording] = useState(RecordingStatus.Stopped);

  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainerRef.current!);
      isRender.current = 1;
    }
  }, []);

  const init = async () => {
    await client.current.init("en-US", "Global", { patchJsMedia: true });
    client.current.on("peer-video-state-change", (payload) => void renderVideo(payload));
    await client.current.join(props.session, props.jwt, data?.user.name ?? "User").catch((e) => {
      console.log(e);
    });
    if (props.isCreator) {
      await writeZoomSessionID.mutateAsync({ zoomSessionsId: client.current.getSessionInfo().sessionId, roomId: props.session });
    }

    recordingClient.current = client.current.getRecordingClient();
    transcriptionClient.current = client.current.getLiveTranscriptionClient();
  };

  const renderVideo = async (event: { action: "Start" | "Stop"; userId: number }) => {
    const mediaStream = client.current.getMediaStream();
    if (event.action === "Stop") {
      const element = await mediaStream.detachVideo(event.userId);
      Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    } else {
      const userVideo = await mediaStream.attachVideo(event.userId, VideoQuality.Video_360P);
      videoContainerRef.current!.appendChild(userVideo as VideoPlayer);
    }
  };

  const startCall = async () => {
    toast({ title: "Joining", description: "Please wait..." });
    await init();
    uitoolkit.closePreview(previewContainerRef.current!);
    setIncall(true);
    const mediaStream = client.current.getMediaStream();
    // @ts-expect-error https://stackoverflow.com/questions/7944460/detect-safari-browser/42189492#42189492
    window.safari ? await WorkAroundForSafari(client.current) : await mediaStream.startAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo().muted);
    await mediaStream.startVideo();
    setIsVideoMuted(!client.current.getCurrentUserInfo().bVideoOn);
    await renderVideo({ action: "Start", userId: client.current.getCurrentUserInfo().userId });
  };

  // not sure about this yet
  const leaveCall = async () => {
    toast({ title: "Leaving", description: "Please wait..." });
    client.current.off("peer-video-state-change", () => void renderVideo);
    await client.current.leave().catch((e) => console.log("leave error", e));
    setIncall(false);
    await router.push("/", undefined, { shallow: false });
  };

  const onCameraClick = async () => {
    const mediaStream = client.current.getMediaStream();
    if (isVideoMuted) {
      await mediaStream.startVideo();
      setIsVideoMuted(false);
      await renderVideo({ action: "Start", userId: client.current.getCurrentUserInfo().userId });
    } else {
      await mediaStream.stopVideo();
      setIsVideoMuted(true);
      await renderVideo({ action: "Stop", userId: client.current.getCurrentUserInfo().userId });
    }
  };

  const onMicrophoneClick = async () => {
    const mediaStream = client.current.getMediaStream();
    isAudioMuted ? await mediaStream?.unmuteAudio() : await mediaStream?.muteAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo()?.muted);
  };

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
      <div id="meeting" className={incall ? "mb-8 mt-8 flex flex-1" : "hidden"} />
      <div className="flex h-full w-full flex-1 flex-col p-8">
        {/* @ts-expect-error html component */}
        <video-player-container ref={videoContainerRef}></video-player-container>
        {!incall ? (
          <>
            <div id="preview" className="mb-8 mt-8 flex flex-1 self-center" ref={previewContainerRef} />
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
          <div className="flex w-full flex-1 flex-col justify-around self-center">
            <div className="mt-8 flex w-[50%] flex-1 justify-around self-center">
              <Button onClick={onCameraClick}>{`${isVideoMuted ? "Unmute Camera" : "Mute Camera"}`}</Button>
              <Button onClick={onMicrophoneClick}>{`${isAudioMuted ? "Unmute Mic" : "Mute Mic"}`}</Button>
              <Button onClick={onTranscriptionClick}>{`${isStartedLiveTranscription ? "stop transcription" : "start transcription"}`}</Button>
              <Button onClick={onRecordingClick}>{`${isRecording === RecordingStatus.Recording ? "stop recording" : "start recording"}`}</Button>
              <Button variant={"outline"} onClick={leaveCall}>
                Leave
              </Button>
            </div>
            {Object.keys(transcriptionSubtitle).length > 0 ? (
              <Card className="mt-8 flex max-h-[200px] flex-col self-center overflow-y-scroll rounded-sm bg-white p-4 shadow-sm">
                {Object.keys(transcriptionSubtitle).map((key) => (
                  <p
                    key={key}
                    className="text-sm text-gray-600"
                    style={
                      transcriptionSubtitle[key]?.isSelf
                        ? {
                            alignSelf: "flex-end",
                          }
                        : {}
                    }
                  >
                    <span className="font-bold">{transcriptionSubtitle[key]?.name}</span>: {transcriptionSubtitle[key]?.text}
                  </p>
                ))}
              </Card>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
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
