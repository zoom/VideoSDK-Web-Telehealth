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
  const [transcriptionSubtitle, setTranscriptionSubtitle] = useState<string>(' ');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number>();
  const [cloudRecording, setCloudRecording] = useState<any>();
  const [isRecording, setIsRecording] = useState(cloudRecording?.getCloudRecordingStatus())


  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      isRender.current = 1;
    }
  }, []);

  // useEffect(() => {
  //   if (transcriptionSubtitle) {
  //     setVisible(true);
  //     if (timerRef.current) {
  //       window.clearTimeout(timerRef.current);
  //     }
  //     timerRef.current = window.setTimeout(() => {
  //       setVisible(false);
  //     }, 3000)
  //   }
  // }, [transcriptionSubtitle])

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
      mediaStream.stopVideo();
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
  const onTranscriptionClick = async() => {
    if (isStartedLiveTranscription) {
      liveTranscription.disableCaptions();
      setIsStartedLiveTranscription(false);
    } else {
      liveTranscription.startLiveTranscription();
      client.on(`caption-message`, (payload) => {
        console.log(`${payload.displayName} said: ${payload.text}`);
        setTranscriptionSubtitle(payload.text)
      });
    }
  }

  //create menu button to include access to previous recordings
  const onRecordingClick = async() => {
    if (isRecording) {
      cloudRecording.stopCloudRecording();
      setIsRecording(false)
    } else {
      cloudRecording.startCloudRecording();
    }
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
           <div>hello</div>
          <video-player-container></video-player-container>
          <Button onClick={onCameraClick}>Start Video</Button>
          <Button onClick={onMicrophoneClick}>Start Audio</Button>
          <Button onClick={onTranscriptionClick}>Start Transcription</Button>
          <Button onClick={onRecordingClick}>Start Recording</Button>
          {/* <div className={classNames('transcript-subtitle', { 'transcript-subtitle-show': visible })}> */}
            <p className="transcript-subtitle-message">{transcriptionSubtitle}</p>
          {/* </div> */}
        </div>

      )}
      <br />
      <SettingsModal />
    </>
  );
};


const SettingsModal = () => {
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
            <TabsTrigger value="t1">TabOne</TabsTrigger>
            <TabsTrigger value="t2">TabTwo</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">
            <div>hello</div>
          </TabsContent>
          <TabsContent value="t2">
            <div>world</div>
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
