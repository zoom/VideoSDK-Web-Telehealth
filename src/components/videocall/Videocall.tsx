import { ConnectionState, ExceptionCode, type AudioOption, type CaptureVideoOption } from "@zoom/videosdk";
import { VideoPlayerComponent, VideoPlayerContainerComponent, useSession as useZoomSession, useSessionUsers } from "@zoom/videosdk-react";
import { Loader2, PhoneOff } from "lucide-react";
import { useSession as useAuthSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { createAudioOptions, createVideoOptions, getZoomClient, getZoomErrorMessage } from "~/lib/zoom-video";
import { api } from "~/utils/api";
import ActionModal from "./ActionModal";
import { CameraButton, MicButton } from "./MuteButtons";
import Preview from "./Preview";
import RecordingButton from "./RecordingButton";
import SettingsModal from "./SettingsModal";
import TranscriptionButton from "./TranscriptionButton";
import { type setTranscriptionType } from "./Transcript";

const Videocall = ({ setTranscriptionSubtitle, isCreator, jwt, session, setInCall }: VideoCallProps) => {
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [currentCamera, setCurrentCamera] = useState("");
  const [currentMicrophone, setCurrentMicrophone] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [currentBackground, setCurrentBackground] = useState("");
  const [joinConfiguration, setJoinConfiguration] = useState<JoinConfiguration | null>(null);
  const { data } = useAuthSession();

  const startCall = () => {
    setJoinConfiguration({
      userName: data?.user.name ?? "User",
      disableVideo: isVideoMuted,
      audioOptions: createAudioOptions(isAudioMuted, currentMicrophone, currentSpeaker),
      videoOptions: createVideoOptions(currentCamera, currentBackground),
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col px-4 pb-4 sm:px-8">
      {joinConfiguration === null ? (
        <Preview
          onJoin={startCall}
          setIsVideoMuted={setIsVideoMuted}
          setIsAudioMuted={setIsAudioMuted}
          currentCamera={currentCamera}
          setCurrentCamera={setCurrentCamera}
          currentMicrophone={currentMicrophone}
          setCurrentMicrophone={setCurrentMicrophone}
          currentSpeaker={currentSpeaker}
          setCurrentSpeaker={setCurrentSpeaker}
          currentBackground={currentBackground}
          setCurrentBackground={setCurrentBackground}
        />
      ) : (
        <JoinedCall
          jwt={jwt}
          session={session}
          isCreator={isCreator}
          configuration={joinConfiguration}
          currentCamera={currentCamera}
          currentSpeaker={currentSpeaker}
          setCurrentSpeaker={setCurrentSpeaker}
          currentBackground={currentBackground}
          setTranscriptionSubtitle={setTranscriptionSubtitle}
          setInCall={setInCall}
          returnToPreview={() => setJoinConfiguration(null)}
        />
      )}
    </div>
  );
};

const JoinedCall = ({
  jwt,
  session,
  isCreator,
  configuration,
  currentCamera,
  currentSpeaker,
  setCurrentSpeaker,
  currentBackground,
  setTranscriptionSubtitle,
  setInCall,
  returnToPreview,
}: JoinedCallProps) => {
  const client = getZoomClient();
  const {
    isInSession,
    isLoading: isJoining,
    isError: hasJoinError,
    error: joinError,
    mediaErrors,
  } = useZoomSession(session, jwt, configuration.userName, undefined, undefined, {
    disableVideo: configuration.disableVideo,
    audioOptions: configuration.audioOptions,
    videoOptions: configuration.videoOptions,
    initOptions: { patchJsMedia: true },
  });
  const participants = useSessionUsers();
  const [hasConnected, setHasConnected] = useState(false);
  const hasHandledJoinRef = useRef(false);
  const { mutateAsync: writeZoomSessionID } = api.room.addZoomSessionId.useMutation();
  const { data } = useAuthSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(
    () => () => {
      setInCall(false);
    },
    [setInCall]
  );

  useEffect(() => {
    const handleConnectionChange = ({ state }: { state: ConnectionState }) => {
      if (state === ConnectionState.Connected) {
        setHasConnected(true);
        setInCall(true);
      } else if (state === ConnectionState.Closed) {
        setInCall(false);
      }
    };
    client.on("connection-change", handleConnectionChange);
    return () => {
      client.off("connection-change", handleConnectionChange);
    };
  }, [client, setInCall]);

  useEffect(() => {
    if (!isInSession || hasHandledJoinRef.current) return;
    hasHandledJoinRef.current = true;
    let cancelled = false;

    const handleJoinedSession = async () => {
      const zoomSessionId = client.getSessionInfo()?.sessionId;
      if (isCreator && zoomSessionId) {
        try {
          await writeZoomSessionID({
            zoomSessionsId: zoomSessionId,
            roomId: session,
          });
        } catch (error) {
          console.error("Unable to save Zoom session ID", error);
          if (!cancelled) {
            toast({
              title: "Appointment connected",
              description: "Recording history could not be linked yet. The call is still active.",
              variant: "destructive",
            });
          }
          return;
        }
      }

      if (!cancelled) {
        toast({
          title: "You’re in",
          description: "Your appointment is connected.",
        });
      }
    };

    void handleJoinedSession();
    return () => {
      cancelled = true;
    };
  }, [client, isCreator, isInSession, session, toast, writeZoomSessionID]);

  useEffect(() => {
    if (!hasJoinError || !joinError) return;
    toast({
      title: "Could not join the appointment",
      description: getZoomErrorMessage(joinError),
      variant: "destructive",
    });
  }, [hasJoinError, joinError, toast]);

  useEffect(() => {
    if (mediaErrors.length === 0) return;
    // Zoom rejects startAudio/startVideo with *_CAPTURE_LOADING while a track is still
    // initializing (race with Preview). The track starts fine right after, so these are benign.
    const transient: number[] = [ExceptionCode.AUDIO_CAPTURE_LOADING, ExceptionCode.VIDEO_CAPTURE_LOADING];
    const realErrors = mediaErrors.filter((e) => !transient.includes(e.errorCode));
    if (realErrors.length === 0) return;
    toast({
      title: "Some call media could not start",
      description: realErrors.map(getZoomErrorMessage).join(" "),
      variant: "destructive",
    });
  }, [mediaErrors, toast]);

  if (hasJoinError) {
    return (
      <CallStatus title="Could not connect" description={getZoomErrorMessage(joinError)}>
        <Button onClick={returnToPreview}>Back to device check</Button>
      </CallStatus>
    );
  }

  if (!isInSession && !hasConnected) {
    return <CallStatus title="Connecting your appointment…" description="This usually takes only a few seconds." loading />;
  }

  if (!isInSession && !isJoining) {
    return (
      <CallStatus title="The appointment ended" description="You are no longer connected.">
        <Button onClick={returnToPreview}>Return to device check</Button>
      </CallStatus>
    );
  }

  const leaveCall = () => {
    toast({ title: "Leaving appointment…" });
    router.push("/");
  };

  return (
    <>
      <div className={`relative mx-auto grid min-h-128 w-full max-w-7xl flex-1 gap-1 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-950/20 ${gridColsClass(participants.length)}`}>
        {/* ponytail: one container per participant so each video/avatar is its own grid cell — the lib appends video into its nearest container ref, so a shared container can't hold avatar placeholders too */}
        {participants.map((participant) => (
          <div key={participant.userId} className="relative min-h-64 overflow-hidden bg-slate-800">
            {participant.bVideoOn ? (
              <VideoPlayerContainerComponent className="h-full w-full">
                <VideoPlayerComponent user={participant} />
              </VideoPlayerContainerComponent>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-600 text-3xl font-semibold text-white">
                  {participant.displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        ))}
        {participants.length <= 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <p className="rounded-full bg-slate-950/70 px-5 py-2.5 text-sm font-medium text-white backdrop-blur">
              {data?.user.role === "doctor" ? "Waiting for the patient to join…" : "Please wait for the healthcare provider to join…"}
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-5 z-20 mx-auto mt-5 flex max-w-fit items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl shadow-slate-950/10 backdrop-blur">
        <CameraButton currentCamera={currentCamera} currentBackground={currentBackground} />
        <MicButton />
        <TranscriptionButton setTranscriptionSubtitle={setTranscriptionSubtitle} />
        <RecordingButton />
        <SettingsModal currentSpeaker={currentSpeaker} setCurrentSpeaker={setCurrentSpeaker} />
        <ActionModal />
        <div className="mx-1 h-7 w-px bg-slate-200" />
        <Button variant="destructive" onClick={leaveCall} title="Leave appointment">
          <PhoneOff />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </div>

      {isJoining && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-medium shadow-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconnecting your appointment…
          </div>
        </div>
      )}
    </>
  );
};

// ponytail: static map so Tailwind can see the class names (no dynamic string interpolation of col counts)
const gridColsClass = (count: number) => {
  if (count <= 1) return "grid-cols-1";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 9) return "grid-cols-2 sm:grid-cols-3";
  return "grid-cols-3 sm:grid-cols-4";
};

const CallStatus = ({
  title,
  description,
  loading = false,
  children,
}: {
  title: string;
  description: string;
  loading?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="grid min-h-128 flex-1 place-items-center">
    <div className="max-w-md text-center">
      {loading && <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin" />}
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      {children && <div className="mt-5 flex justify-center gap-2">{children}</div>}
    </div>
  </div>
);

type VideoCallProps = {
  jwt: string;
  session: string;
  isCreator: boolean;
  setTranscriptionSubtitle: setTranscriptionType;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

type JoinConfiguration = {
  userName: string;
  disableVideo: boolean;
  audioOptions: AudioOption;
  videoOptions?: CaptureVideoOption;
};

type JoinedCallProps = {
  jwt: string;
  session: string;
  isCreator: boolean;
  configuration: JoinConfiguration;
  currentCamera: string;
  currentSpeaker: string;
  setCurrentSpeaker: React.Dispatch<React.SetStateAction<string>>;
  currentBackground: string;
  setTranscriptionSubtitle: setTranscriptionType;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
  returnToPreview: () => void;
};

export default Videocall;
