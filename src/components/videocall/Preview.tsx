import ZoomVideo, { type LocalAudioTrack, type LocalVideoTrack, type TestMicrophoneReturn, type TestSpeakerReturn } from '@zoom/videosdk'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { Button } from "~/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume, Volume1, Volume2, ChevronRight, CheckIcon, Image as ImageIcon, StopCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import VirtualBackgroundImage from '../../../public/VirtualBackgroundImage.png'
import mobileCheck from "../../utils/mobilecheck";

interface MyLocalAudioTrack extends LocalAudioTrack {
  isAudioStarted: boolean;
  tester: { isRunning: boolean }
}

interface MyLocalVideoTrack extends LocalVideoTrack {
  isVideoStarted: boolean;
}

const Preview = ({ init, setIsVideoMuted, setIsAudioMuted, currentBackground, setCurrentBackground }: {
  init: () => Promise<void>,
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>,
  setIsAudioMuted: Dispatch<SetStateAction<boolean>>,
  currentBackground: string,
  setCurrentBackground: Dispatch<SetStateAction<string>>
}) => {

  const hasMounted = useRef(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>();
  const [audioInDevices, setAudioInDevices] = useState<MediaDeviceInfo[]>();
  const [audioOutDevices, setAudioOutDevices] = useState<MediaDeviceInfo[]>();
  const [currentCamera, setCurrentCamera] = useState<string>('');
  const [currentMicrophone, setCurrentMicrophone] = useState<string>('');
  const [microphoneTester, setMicrophoneTester] = useState<TestMicrophoneReturn>();
  const [speakerTester, setSpeakerTester] = useState<TestSpeakerReturn>();
  const [speakerPlaying, setSpeakerPlaying] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('');
  const [localAudioTrack, setLocalAudioTrack] = useState({} as MyLocalAudioTrack);
  const [localVideoTrack, setLocalVideoTrack] = useState({} as MyLocalVideoTrack);
  const [localSpeakerTrack, setLocalSpeakerTrack] = useState({} as MyLocalAudioTrack);
  const [mobileDevice, setMobileDevice] = useState(false);
  const [audioOnToggle, setAudioOnToggle] = useState(false);
  const [videoOnToggle, setVideoOnToggle] = useState(false);
  const [volumeBtn, setVolumeBtn] = useState(2);
  const [animation, setAnimation] = useState<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = useCallback(async (background?: string, cameraId?: string) => {
    let devices;
    let cameraDevices;
    let videoTrack;

    if (background) localVideoTrack.isVideoStarted ?? await localVideoTrack.stop();

    if (mobileDevice) {
      cameraDevices = [{
        label: 'Front Camera',
        deviceId: 'user'
      },
      {
        label: 'Back Camera',
        deviceId: 'environment'
      }]
    }
    else {
      devices = await ZoomVideo.getDevices();
      cameraDevices = devices.filter((device) => {
        return device.kind === 'videoinput';
      });

      videoTrack = ZoomVideo.createLocalVideoTrack(cameraId ?? cameraDevices[0]?.deviceId ?? '');
      setCurrentCamera(cameraId ?? cameraDevices[0]?.deviceId ?? '');
    }

    setVideoDevices(cameraDevices as MediaDeviceInfo[]);

    if (videoTrack) {
      setLocalVideoTrack(videoTrack as MyLocalVideoTrack);
      await videoTrack.start(document.querySelector('#local-preview-video')!, { imageUrl: background ?? '' });
      setCurrentBackground(background ?? '');
      setVideoOnToggle(true);
      setIsVideoMuted(false);
    }
  }, [localVideoTrack, mobileDevice, setCurrentBackground, setIsVideoMuted]);

  const startMicrophone = useCallback(async (microphoneId?: string) => {
    const devices = await ZoomVideo.getDevices();
    const microphoneDevices = devices.filter((device) => {
      return device.kind === 'audioinput'
    });
    const audioTrack = ZoomVideo.createLocalAudioTrack(microphoneId ?? microphoneDevices[0]?.deviceId ?? '');
    console.log('audioTrack', audioTrack)
    setCurrentMicrophone(microphoneId ?? microphoneDevices[0]?.deviceId ?? '');
    setAudioInDevices(microphoneDevices);

    if (audioTrack) {
      setLocalAudioTrack(audioTrack as MyLocalAudioTrack);
      await audioTrack.start();
      const inputLevelElm: HTMLInputElement = document.querySelector("#mic-input-level")!;
      const tester = audioTrack.testMicrophone({
        microphoneId: currentMicrophone ?? '',
        onAnalyseFrequency: (v) => {
          inputLevelElm.value = v.toString();
        },
      });
      setMicrophoneTester(tester);
      setAudioOnToggle(true);
      setIsAudioMuted(false);
    }
  }, [currentMicrophone, setIsAudioMuted]);

  const startSpeaker = async (speakerId?: string) => {
    const devices = await ZoomVideo.getDevices();
    const speakerDevices = devices.filter((device) => {
      return device.kind === 'audiooutput'
    });
    const speakerTrack = ZoomVideo.createLocalAudioTrack(speakerId ?? speakerDevices[0]?.deviceId ?? '');

    setCurrentSpeaker(speakerId ?? speakerDevices[0]?.deviceId ?? '');
    setAudioOutDevices(speakerDevices);

    if (speakerTrack) {
      setLocalSpeakerTrack(speakerTrack as MyLocalAudioTrack);
      await speakerTrack.start();
    }
  };

  const switchCamera = async (cameraId: string) => {
    await localVideoTrack.switchCamera(cameraId);
    setCurrentCamera(cameraId);
  };

  const switchMicrophone = async (microphoneId: string) => {
    if (localAudioTrack.tester.isRunning) microphoneTester?.stop();
    if (localAudioTrack.isAudioStarted) await localAudioTrack.stop();
    await startMicrophone(microphoneId);
  };

  const switchSpeaker = async (speakerId: string) => {
    if (localSpeakerTrack.tester.isRunning) speakerTester?.stop();
    if (localSpeakerTrack.isAudioStarted) await localSpeakerTrack.stop();
    await startSpeaker(speakerId);
  };

  const toggleCamera = async () => {
    if (videoOnToggle) {
      if (localVideoTrack.isVideoStarted) await localVideoTrack.stop();
      setVideoOnToggle(false);
      setIsVideoMuted(true);
    } else {
      await localVideoTrack.start(document.querySelector('#local-preview-video')!, { imageUrl: currentBackground ?? '' });
      setVideoOnToggle(true);
      setIsVideoMuted(false);
    }
  };
  const toggleMicrophone = async () => {
    if (audioOnToggle) {
      const inputLevelElm: HTMLInputElement | null = document.querySelector("#mic-input-level");
      if (inputLevelElm) inputLevelElm.value = "0";
      microphoneTester?.stop();
      if (localAudioTrack.isAudioStarted) await localAudioTrack.stop();
      setAudioOnToggle(false);
      setIsAudioMuted(true);
    } else {
      await localAudioTrack.start();
      testMicrophone();
      setAudioOnToggle(true);
      setIsAudioMuted(false);
    }
  };

  const testMicrophone = () => {
    const inputLevelElm: HTMLInputElement | null = document.querySelector("#mic-input-level");
    const tester = localAudioTrack.testMicrophone({
      microphoneId: currentMicrophone ?? '',
      onAnalyseFrequency: (v) => {
        if (inputLevelElm) inputLevelElm.value = v.toString();
      },
    });
    setMicrophoneTester(tester);
  };

  const animateSpeaker = (i: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setVolumeBtn(i);
        resolve();
      }, 100);
    });
  };

  const playSpeaker = async () => {
    const tester = localSpeakerTrack.testSpeaker({ speakerId: currentSpeaker });

    const animationId = setInterval(() => {
      void (async () => {
        for (let i = 0; i < 3; i++) await animateSpeaker(i);
      })();
    }, 1000);

    setSpeakerPlaying(true);
    setSpeakerTester(tester);
    setAnimation(animationId);
  };

  const stopSpeaker = () => {
    if (localSpeakerTrack.tester.isRunning) speakerTester?.stop();
    setSpeakerPlaying(false);
    clearInterval(animation);
  };

  const checkMobile = () => {
    if (mobileCheck()) setMobileDevice(true);
    console.log("is mobile browser:", mobileCheck());
  };

  useEffect(() => {
    if (!hasMounted.current) {
      const startPreview = async () => {
        checkMobile();
        await init();
        await startCamera();
        await startMicrophone();
        await startSpeaker();
        setIsLoading(false);
      };
      void startPreview();
    }
    return () => { hasMounted.current = true; }
  }, [init, startCamera, startMicrophone]);

  return (
    <div id="preview" className="mb-8 mt-8 flex flex-1 self-center preview-video-container">
      {/* @ts-expect-error html component */}
      <video-player-container style={{ background: '#403f3f', border: 'solid 12px #403f3f', borderRadius: '12px' }}>
        {/* @ts-expect-error html component */}
        <video-player id="local-preview-video"></video-player>
        {/* @ts-expect-error html component */}
      </video-player-container>
      <div className='preview-controls-container'>
        <div className='preview-control'>
          <div className='btn-drop-container'>
            <Button variant={"outline"} title="microphone" className='preview-btn' onClick={toggleMicrophone} disabled={isLoading}>
              {!audioOnToggle ? <MicOff color="white" /> : <Mic color="white" />}
            </Button>
            <div style={{ marginLeft: '10px' }}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" title="Select Microphone">
                    <ChevronRight />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Microphone</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(audioInDevices && audioInDevices.length > 0) && audioInDevices.map((mic: MediaDeviceInfo) => {
                    return <DropdownMenuItem key={mic.deviceId} onClick={() => { void switchMicrophone(mic.deviceId) }}>
                      {mic.label} {(currentMicrophone === mic.deviceId) && <CheckIcon />}
                    </DropdownMenuItem>
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div>
            <progress id="mic-input-level" max="100" value="0"></progress>
          </div>
        </div>
        <div className='preview-control'>
          <div className='btn-drop-container'>
            <Button variant={"outline"} title="camera" className='preview-btn' onClick={toggleCamera} disabled={isLoading}>
              {!videoOnToggle ? <VideoOff color="white" /> : <Video color="white" />}
            </Button>
            <div style={{ marginLeft: '10px' }}>
              <DropdownMenu >
                <DropdownMenuTrigger>
                  <Button variant="outline" title="Select Camera">
                    <ChevronRight />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Camera</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(videoDevices && videoDevices.length > 0) && videoDevices.map((camera: MediaDeviceInfo) => {
                    return (
                      <DropdownMenuItem key={camera.deviceId} onClick={() => { void switchCamera(camera.deviceId) }}>
                        {camera.label} {(currentCamera === camera.deviceId) && <CheckIcon />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!mobileDevice && <div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" title="Select Virtual Background">
                    <ImageIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Virtual Background</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem key={0} onClick={() => { void startCamera('', currentCamera) }}>{'None'}{(currentBackground === '') && <CheckIcon />}</DropdownMenuItem>
                  <DropdownMenuItem key={1} onClick={() => { void startCamera('blur', currentCamera) }}>{'Blur'}{(currentBackground === 'blur') && <CheckIcon />}</DropdownMenuItem>
                  <DropdownMenuItem key={2} onClick={() => { void startCamera(VirtualBackgroundImage.src, currentCamera) }}>{'Beach'}{(currentBackground === VirtualBackgroundImage.src) && <CheckIcon />}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
          </div>
        </div>
        <div className='preview-control'>
          <div className='btn-drop-container'>
            <Button variant={"outline"} title="speaker" className='preview-btn' onClick={playSpeaker} disabled={speakerPlaying || isLoading}>
              {(volumeBtn === 0) ? <Volume color="white" /> :
                (volumeBtn === 1) ? <Volume1 color="white" /> : <Volume2 color="white" />}
            </Button>
            <div style={{ marginLeft: '10px' }}>
              <DropdownMenu>
                <DropdownMenuTrigger disabled={speakerPlaying}>
                  <Button variant="outline" title="Select Speaker">
                    <ChevronRight />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Speaker</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(audioOutDevices && audioOutDevices.length > 0) && audioOutDevices.map((speaker: MediaDeviceInfo) => {
                    return <DropdownMenuItem key={speaker.deviceId} onClick={() => { void switchSpeaker(speaker.deviceId) }}>
                      {speaker.label} {(currentSpeaker === speaker.deviceId) && <CheckIcon />}
                    </DropdownMenuItem>
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {speakerPlaying && <DropdownMenu>
              <DropdownMenuTrigger onClick={stopSpeaker}>
                <Button variant="outline" title="Stop Speaker"><StopCircle /></Button>
              </DropdownMenuTrigger>
            </DropdownMenu>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
