import ZoomVideo, {
  type LocalAudioTrack,
  type LocalVideoTrack,
  type TestMicrophoneReturn,
  type TestSpeakerReturn,
  type VideoPlayer,
} from "@zoom/videosdk";
import {
  CheckIcon,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Video,
  VideoOff,
} from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import VirtualBackgroundImage from "../../../public/VirtualBackgroundImage.png";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useToast } from "~/components/ui/use-toast";

type PreviewProps = {
  init: () => Promise<void>;
  onJoin: () => Promise<void>;
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>;
  setIsAudioMuted: Dispatch<SetStateAction<boolean>>;
  currentBackground: string;
  setCurrentBackground: Dispatch<SetStateAction<string>>;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
  ) {
    return error.reason;
  }
  return "Check your browser permissions and try again.";
};

const Preview = ({
  init,
  onJoin,
  setIsVideoMuted,
  setIsAudioMuted,
  currentBackground,
  setCurrentBackground,
}: PreviewProps) => {
  const previewElementRef = useRef<VideoPlayer | null>(null);
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const microphoneTesterRef = useRef<TestMicrophoneReturn | null>(null);
  const speakerTesterRef = useRef<TestSpeakerReturn | null>(null);
  const mountedRef = useRef(false);
  const initialBackgroundRef = useRef(currentBackground);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInDevices, setAudioInDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutDevices, setAudioOutDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState("");
  const [currentMicrophone, setCurrentMicrophone] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  const { toast } = useToast();

  const stopMicrophoneTester = useCallback(() => {
    microphoneTesterRef.current?.stop();
    microphoneTesterRef.current?.destroy();
    microphoneTesterRef.current = null;
  }, []);

  const stopSpeakerTester = useCallback(() => {
    speakerTesterRef.current?.stop();
    speakerTesterRef.current?.destroy();
    speakerTesterRef.current = null;
    if (mountedRef.current) setIsTestingSpeaker(false);
  }, []);

  const stopPreview = useCallback(async () => {
    stopMicrophoneTester();
    stopSpeakerTester();

    const videoTrack = videoTrackRef.current;
    const audioTrack = audioTrackRef.current;
    videoTrackRef.current = null;
    audioTrackRef.current = null;

    await Promise.allSettled([videoTrack?.stop(), audioTrack?.stop()]);
  }, [stopMicrophoneTester, stopSpeakerTester]);

  const startMicrophoneTest = useCallback(
    (track: LocalAudioTrack, microphoneId: string) => {
      stopMicrophoneTester();
      microphoneTesterRef.current = track.testMicrophone({
        microphoneId,
        onAnalyseFrequency: (value) => {
          const meter = document.querySelector<HTMLProgressElement>(
            "#mic-input-level",
          );
          if (meter) meter.value = value;
        },
      }) ?? null;
    },
    [stopMicrophoneTester],
  );

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const initialisePreview = async () => {
      try {
        await init();
        if (cancelled) return;

        const devices = await ZoomVideo.getDevices();
        if (cancelled) return;

        const cameras = devices.filter((device) => device.kind === "videoinput");
        const microphones = devices.filter(
          (device) => device.kind === "audioinput",
        );
        const speakers = devices.filter(
          (device) => device.kind === "audiooutput",
        );

        setVideoDevices(cameras);
        setAudioInDevices(microphones);
        setAudioOutDevices(speakers);

        const cameraId = cameras[0]?.deviceId ?? "";
        const microphoneId = microphones[0]?.deviceId ?? "";
        setCurrentCamera(cameraId);
        setCurrentMicrophone(microphoneId);
        setCurrentSpeaker(speakers[0]?.deviceId ?? "");

        const previewElement = previewElementRef.current;
        if (previewElement && cameraId) {
          const videoTrack = ZoomVideo.createLocalVideoTrack(cameraId);
          videoTrackRef.current = videoTrack;
          const initialBackground = initialBackgroundRef.current;
          await videoTrack.start(
            previewElement,
            initialBackground ? { imageUrl: initialBackground } : undefined,
          );
          if (cancelled) {
            await videoTrack.stop();
            return;
          }
          setVideoOn(true);
          setIsVideoMuted(false);
        } else {
          setVideoOn(false);
          setIsVideoMuted(true);
        }

        if (microphoneId) {
          const audioTrack = ZoomVideo.createLocalAudioTrack(microphoneId);
          audioTrackRef.current = audioTrack;
          await audioTrack.start();
          if (cancelled) {
            await audioTrack.stop();
            return;
          }
          startMicrophoneTest(audioTrack, microphoneId);
          setAudioOn(true);
          setIsAudioMuted(false);
        } else {
          setAudioOn(false);
          setIsAudioMuted(true);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Camera or microphone unavailable",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void initialisePreview();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      void stopPreview();
    };
  }, [
    init,
    setIsAudioMuted,
    setIsVideoMuted,
    startMicrophoneTest,
    stopPreview,
    toast,
  ]);

  const toggleCamera = async () => {
    const track = videoTrackRef.current;
    const previewElement = previewElementRef.current;
    if (!track || !previewElement) return;

    try {
      if (videoOn) {
        await track.stop();
        setVideoOn(false);
        setIsVideoMuted(true);
      } else {
        await track.start(
          previewElement,
          currentBackground ? { imageUrl: currentBackground } : undefined,
        );
        setVideoOn(true);
        setIsVideoMuted(false);
      }
    } catch (error) {
      toast({
        title: "Could not change camera",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const toggleMicrophone = async () => {
    const track = audioTrackRef.current;
    if (!track) return;

    try {
      if (audioOn) {
        stopMicrophoneTester();
        await track.stop();
        setAudioOn(false);
        setIsAudioMuted(true);
      } else {
        await track.start();
        startMicrophoneTest(track, currentMicrophone);
        setAudioOn(true);
        setIsAudioMuted(false);
      }
    } catch (error) {
      toast({
        title: "Could not change microphone",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const switchCamera = async (cameraId: string) => {
    const track = videoTrackRef.current;
    if (!track) return;
    await track.switchCamera(cameraId);
    setCurrentCamera(cameraId);
  };

  const switchMicrophone = async (microphoneId: string) => {
    stopMicrophoneTester();
    await audioTrackRef.current?.stop();

    const track = ZoomVideo.createLocalAudioTrack(microphoneId);
    audioTrackRef.current = track;
    await track.start();
    startMicrophoneTest(track, microphoneId);
    setCurrentMicrophone(microphoneId);
    setAudioOn(true);
    setIsAudioMuted(false);
  };

  const changeBackground = async (background: string) => {
    const track = videoTrackRef.current;
    const previewElement = previewElementRef.current;
    if (!track || !previewElement) return;

    if (!videoOn) {
      setCurrentBackground(background);
      return;
    }

    const previousBackground = currentBackground;
    setIsChangingBackground(true);
    try {
      // Starting without a background does not initialize Zoom's background
      // processor. Restarting is reliable for transitions both to and from it.
      await track.stop();
      await track.start(
        previewElement,
        background ? { imageUrl: background } : undefined,
      );
      setCurrentBackground(background);
    } catch (error) {
      // Restore the previous preview so a failed effect never leaves the
      // camera active behind an empty player.
      try {
        await track.stop();
        await track.start(
          previewElement,
          previousBackground ? { imageUrl: previousBackground } : undefined,
        );
      } catch {
        setVideoOn(false);
        setIsVideoMuted(true);
      }
      toast({
        title: "Could not change background",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsChangingBackground(false);
    }
  };

  const testSpeaker = () => {
    if (isTestingSpeaker) {
      stopSpeakerTester();
      return;
    }

    const tester = audioTrackRef.current?.testSpeaker({
      speakerId: currentSpeaker || undefined,
    });
    if (tester) {
      speakerTesterRef.current = tester;
      setIsTestingSpeaker(true);
    }
  };

  const join = async () => {
    setIsJoining(true);
    await stopPreview();
    await onJoin();
    if (mountedRef.current) setIsJoining(false);
  };

  const disabled = isLoading || isJoining || isChangingBackground;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-950/15">
        {/* Zoom recommends its VideoPlayer element for virtual backgrounds. */}
        {/* @ts-expect-error Zoom registers this custom element at runtime. */}
        <video-player
          ref={(element: VideoPlayer | null) => {
            previewElementRef.current = element;
          }}
          className="h-full w-full object-cover"
        />
        {!videoOn && !isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-slate-900 text-center text-slate-300">
            <div>
              <VideoOff className="mx-auto mb-3 h-8 w-8" />
              <p className="text-sm font-medium">Camera is off</p>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-slate-900 text-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your devices…
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <DeviceControl
            label={audioOn ? "Mute microphone" : "Unmute microphone"}
            onClick={() => void toggleMicrophone()}
            disabled={disabled}
            icon={audioOn ? <Mic /> : <MicOff />}
            devices={audioInDevices}
            currentDevice={currentMicrophone}
            menuLabel="Microphone"
            onSelect={(id) => void switchMicrophone(id)}
          />
          <progress
            id="mic-input-level"
            aria-label="Microphone input level"
            max="100"
            value="0"
            className="h-1.5 w-16 accent-emerald-600"
          />
          <DeviceControl
            label={videoOn ? "Turn camera off" : "Turn camera on"}
            onClick={() => void toggleCamera()}
            disabled={disabled}
            icon={videoOn ? <Video /> : <VideoOff />}
            devices={videoDevices}
            currentDevice={currentCamera}
            menuLabel="Camera"
            onSelect={(id) => void switchCamera(id)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Virtual background"
                disabled={disabled}
              >
                <ImageIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Background</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { label: "None", value: "" },
                { label: "Blur", value: "blur" },
                { label: "Beach", value: VirtualBackgroundImage.src },
              ].map((background) => (
                <DropdownMenuItem
                  key={background.label}
                  onClick={() => void changeBackground(background.value)}
                >
                  {background.label}
                  {currentBackground === background.value && (
                    <CheckIcon className="ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {audioOutDevices.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  title="Speaker options"
                  disabled={disabled}
                >
                  <Volume2 />
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Speaker</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {audioOutDevices.map((speaker) => (
                  <DropdownMenuItem
                    key={speaker.deviceId}
                    onClick={() => setCurrentSpeaker(speaker.deviceId)}
                  >
                    {speaker.label || "Default speaker"}
                    {currentSpeaker === speaker.deviceId && (
                      <CheckIcon className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={testSpeaker}>
                  {isTestingSpeaker ? "Stop test" : "Test speaker"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button
          size="lg"
          className="min-w-36"
          onClick={() => void join()}
          disabled={disabled}
        >
          {isJoining && <Loader2 className="animate-spin" />}
          {isJoining ? "Joining…" : "Join appointment"}
        </Button>
      </div>
    </section>
  );
};

type DeviceControlProps = {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  devices: MediaDeviceInfo[];
  currentDevice: string;
  menuLabel: string;
  onSelect: (deviceId: string) => void;
};

const DeviceControl = ({
  label,
  onClick,
  disabled,
  icon,
  devices,
  currentDevice,
  menuLabel,
  onSelect,
}: DeviceControlProps) => (
  <div className="inline-flex">
    <Button
      variant="outline"
      className="rounded-r-none border-r-0"
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-l-none"
          title={`Select ${menuLabel.toLowerCase()}`}
          disabled={disabled || devices.length === 0}
        >
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onClick={() => onSelect(device.deviceId)}
          >
            {device.label || `Default ${menuLabel.toLowerCase()}`}
            {currentDevice === device.deviceId && (
              <CheckIcon className="ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default Preview;
