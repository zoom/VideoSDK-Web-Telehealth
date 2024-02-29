import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";
import ZoomVideo from '@zoom/videosdk';
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
  
  const client = ZoomVideo.createClient();
  const [videoStarted, setVideoStarted] = useState(client.getCurrentUserInfo()?.bVideoOn);
  const [audioStarted, setAudioStarted] = useState(client.getCurrentUserInfo() && client.getCurrentUserInfo().audio !== '')
  const [isMuted, setIsMuted] = useState(client.getCurrentUserInfo()?.muted);
  const [mediaStream, setMediaStream] = useState<any>()
  const [liveTranscription, setLiveTranscription] = useState<any>();
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState('');
  // const [visible, setVisible] = useState(false);
  // const timerRef = useRef<number>();
  const [cloudRecording, setCloudRecording] = useState<any>();
  const [isRecording, setIsRecording] = useState(cloudRecording?.getCloudRecordingStatus());
  const [receiveRecordings, setReceiveRecordings] = useState(false);


  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      isRender.current = 1;
    }
  }, []);

  const init = async() => {
    await client.init('en-US', 'CDN')
    try {
      await client.join(props.session, props.jwt, data?.user.name ?? "User").catch((e) => {
        console.log(e)
      });
      setMediaStream(client.getMediaStream());
      setLiveTranscription(client.getLiveTranscriptionClient());
      setCloudRecording(client.getRecordingClient())
    } catch(e) {
      console.log(e)
    }
  }

  const startCall = async () => {
    setIncall(true);
    uitoolkit.closePreview(previewContainer.current!);
    init();
  }

  const leaveCall = () => {
    try {
    client.leave(true)
    } catch (e) {}
    void router.push("/");
  };

  const onCameraClick = async() => {
    console.log(mediaStream)
    if (videoStarted) {
      await mediaStream.stopVideo();
      setVideoStarted(false);
    } else {
      await mediaStream.startVideo();
      client.getAllUser().forEach((user) => {
        if (user.bVideoOn) {
          mediaStream.attachVideo(user.userId, 3).then((userVideo) => {
            document.querySelector('video-player-container')?.appendChild(userVideo)
          })
        }
      })
      setVideoStarted(true)
    }
  }

  const onMicrophoneClick = async() => {
    //adjust button to change wording with mute/unmute
    if (audioStarted) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
      } else {
        await mediaStream?.muteAudio();
      }
    } else {
      await mediaStream?.startAudio();
      setAudioStarted(true);
    }
  }
  //create nice captions + disable button if audio is not started
  const onTranscriptionClick = async () => {
    if (isStartedLiveTranscription) {
      await liveTranscription.disableCaptions();
      setIsStartedLiveTranscription(false);
    } else {
      await liveTranscription.startLiveTranscription();
      client.on(`caption-message`, (payload) => {
        console.log(`${payload.displayName} said: ${payload.text}`);
        setTranscriptionSubtitle(payload.text)
        setIsStartedLiveTranscription(true)
      });
    }
  }

  //create menu button to include access to previous recordings
  const onRecordingClick = async() => {
    if (isRecording) {
      await cloudRecording.stopCloudRecording();
      setIsRecording(false)
    } else {
      await cloudRecording.startCloudRecording();
    }
  }

  const onReceiveRecordings = (data:any) => {
    const downloadLink = data.downloadLink;
    const session = data.sessionId;


  }


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
          <video-player-container></video-player-container>
          <Button onClick={onCameraClick}>{`${videoStarted ? 'stop camera' : 'start camera'}`}</Button>
          <Button onClick={onMicrophoneClick}>{`${audioStarted ? (isMuted ? 'unMute' : 'Mute' ) : 'start audio'}`}</Button>
          <Button onClick={onTranscriptionClick}>{`${isStartedLiveTranscription ? 'stop transcription' : 'start transcription'}`}</Button>
          <Button onClick={onRecordingClick}>{`${isRecording ? 'stop recording' : 'start recording'}`}</Button>
            <p>{transcriptionSubtitle}</p>
        </div>

      )}
      <br />
      <SettingsModal />
    </>
  );
};


const SettingsModal = () => {
const [cameraList, setCameraList] = useState<Array<Object>>();
const [micList, setMicList] = useState<Array<Object>>();
const [speakerList, setSpeakerList] = useState<Array<Object>>();

  const getDevices = async () => {
    const allDevices = await ZoomVideo.getDevices();

    const cameraDevices = allDevices.filter((el) => {
    return el.kind === 'videoinput';
    });
    const micDevices = allDevices.filter((el) => {
      return el.kind === 'audioinput';
    });
    const speakerDevices = allDevices.filter((el) => {
      return el.kind === 'audiooutput'
    });

    return {
      cameras: cameraDevices.map((el) => {
        return {label: el.label, deviceId: el.deviceId}
      }),
      mics: micDevices.map((el) => {
        return {label: el.label, deviceId: el.deviceId}
      }),
      speakers: speakerDevices.map((el) => {
        return  {label: el.label, deviceId: el.deviceId}
      })
    }
  }
  

  useEffect(() => {
    getDevices().then((devices) => {
      setCameraList(devices.cameras);
      setMicList(devices.mics);
      setSpeakerList(devices.speakers)
    }) 
  }, [])

  console.log('camera', micList);
 
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
            {cameraList?.map((camera) => {
              <p>{camera.label}</p>
            })}
          </TabsContent>
          <TabsContent value="t2">
          Select Microphone
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
