import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";
import ZoomVideo from '@zoom/videosdk';

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

  let liveTranscription: any;

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
     const stream = client.getMediaStream();
     console.log('init', stream)
     setMediaStream(stream);
    //  console.log('MEDIASTREAM', mediaStream)
    } catch(e) {
      console.log(e)
    }
  }

  const startCall = async () => {
    setIncall(true);
    uitoolkit.closePreview(previewContainer.current!);
    init();
    // console.log('stream', mediaStream)
    // await client.init('en-US', 'CDN').then(() => {
    //   client.join(props.session, props.jwt, data?.user.name ?? "User").then(() => {
    //     console.log('session Joined');
    //     stream = client.getMediaStream();
    //     console.log('stream', stream)
    //     liveTranscription = client.getLiveTranscriptionClient();
    //   }).catch((e) => {
    //     console.log(e)
    //   })
    }
    
    // uitoolkit.joinSession(sessionContainer.current!, {
    //   videoSDKJWT: props.jwt,
    //   sessionName: props.session,
    //   userName: data?.user.name ?? "User",
    //   sessionPasscode: "",
    //   features: ["video", "audio", "share", "chat", "users", "settings"],
    // });
    // uitoolkit.onSessionClosed(leaveCall);
  // };

  const leaveCall = () => {
    try {
      // if (!incall) {
      //   uitoolkit.closePreview(previewContainer.current!);
      // } else {
      //   uitoolkit.closeSession(sessionContainer.current!);
      // }
    client.leave(true)
    } catch (e) {}
    void router.push("/");
  };

  const onCameraClick = async() => {
    console.log(mediaStream)
    await mediaStream.startVideo();
    client.getAllUser().forEach((user) => {
      if (user.bVideoOn) {
        mediaStream.attachVideo(user.userId, 3).then((userVideo) => {
          document.querySelector('video-player-container')?.appendChild(userVideo)
        })
      }
    })
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
          <Button onClick={onCameraClick}>Start Video</Button>
          <video-player-container></video-player-container>
        </div>

      )}
    </>
  );
};

export default Videocall;
