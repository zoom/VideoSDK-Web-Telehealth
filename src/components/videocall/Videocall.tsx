import {
  type ChatMessage,
  type Participant,
  type VideoClient,
  VideoQuality,
} from "@zoom/videosdk";
import { useSession } from "next-auth/react";
import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2, PhoneOff } from "lucide-react";

import { type ChatRecord } from "~/components/chat/Chat";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { WorkAroundForSafari } from "~/utils/safari";
import ActionModal from "./ActionModal";
import { CameraButton, MicButton } from "./MuteButtons";
import Preview from "./Preview";
import RecordingButton from "./RecordingButton";
import SettingsModal from "./SettingsModal";
import TranscriptionButton from "./TranscriptionButton";
import { type setTranscriptionType } from "./Transcript";

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
  return "Please check your device permissions and try again.";
};

const getHtmlElements = (value: unknown): HTMLElement[] => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
};

const Videocall = (props: VideoCallProps) => {
  const {
    setTranscriptionSubtitle,
    isCreator,
    jwt,
    session,
    client,
    inCall,
    setInCall,
    setRecords,
  } = props;
  const zoomClient = client.current;
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [currentBackground, setCurrentBackground] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const videoContainerRef = useRef<HTMLElement | null>(null);
  const attachedVideosRef = useRef(new Map<number, HTMLElement[]>());
  const initPromiseRef = useRef<Promise<unknown> | null>(null);
  const writeZoomSessionID = api.room.addZoomSessionId.useMutation();
  const { data } = useSession();
  const { toast } = useToast();

  const init = useCallback(async () => {
    initPromiseRef.current ??= zoomClient.init("en-US", "Global", {
      patchJsMedia: true,
    });
    await initPromiseRef.current;
  }, [zoomClient]);

  const removeAttachedVideo = useCallback(
    async (userId: number) => {
      const existing = attachedVideosRef.current.get(userId) ?? [];
      existing.forEach((element) => element.remove());
      attachedVideosRef.current.delete(userId);

      try {
        const detached: unknown = await zoomClient
          .getMediaStream()
          .detachVideo(userId);
        getHtmlElements(detached).forEach((element) => element.remove());
      } catch {
        // The SDK throws when the participant did not have an attached video.
      }
    },
    [zoomClient],
  );

  const renderVideo = useCallback(
    async (event: { action: "Start" | "Stop"; userId: number }) => {
      if (event.action === "Stop") {
        await removeAttachedVideo(event.userId);
        return;
      }

      const videoContainer = videoContainerRef.current;
      if (!videoContainer) return;

      await removeAttachedVideo(event.userId);
      const attached: unknown = await zoomClient
        .getMediaStream()
        .attachVideo(event.userId, VideoQuality.Video_360P);
      const elements = getHtmlElements(attached);
      if (elements.length === 0) {
        throw new Error("Zoom did not return a video element.");
      }
      elements.forEach((element) => videoContainer.appendChild(element));
      attachedVideosRef.current.set(event.userId, elements);
    },
    [removeAttachedVideo, zoomClient],
  );

  const onPeerVideoStateChange = useCallback(
    (payload: { action: "Start" | "Stop"; userId: number }) => {
      void renderVideo(payload).catch((error: unknown) => {
        console.error("Unable to render participant video", error);
      });
    },
    [renderVideo],
  );

  const onChatMessage = useCallback(
    (payload: ChatMessage) => {
      setRecords((previous) => [...previous, payload]);
      if (
        payload.sender.userId !== zoomClient.getCurrentUserInfo()?.userId
      ) {
        toast({
          title: payload.sender.name,
          description: payload.message,
          duration: 2000,
        });
      }
    },
    [setRecords, toast, zoomClient],
  );

  const unregisterListeners = useCallback(() => {
    zoomClient.off("peer-video-state-change", onPeerVideoStateChange);
    zoomClient.off("chat-on-message", onChatMessage);
  }, [onChatMessage, onPeerVideoStateChange, zoomClient]);

  useEffect(() => unregisterListeners, [unregisterListeners]);

  const startCall = async () => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      await init();
      unregisterListeners();
      zoomClient.on("peer-video-state-change", onPeerVideoStateChange);
      zoomClient.on("chat-on-message", onChatMessage);

      await zoomClient.join(session, jwt, data?.user.name ?? "User");
      setInCall(true);

      // Let React reveal the persistent call surface before attaching video.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      const mediaStream = zoomClient.getMediaStream();
      // @ts-expect-error Safari exposes this browser-specific property.
      if (window.safari) {
        await WorkAroundForSafari(zoomClient);
      } else {
        await mediaStream.startAudio();
      }

      if (isAudioMuted) {
        await mediaStream.muteAudio();
      } else {
        await mediaStream.unmuteAudio();
      }
      setIsAudioMuted(
        zoomClient.getCurrentUserInfo()?.muted ?? isAudioMuted,
      );

      if (!isVideoMuted) {
        await mediaStream.startVideo(
          currentBackground
            ? { virtualBackground: { imageUrl: currentBackground } }
            : undefined,
        );
      }

      const users: Participant[] = zoomClient.getAllUser();
      await Promise.all(
        users
          .filter((user) => user.bVideoOn)
          .map((user) =>
            renderVideo({ action: "Start", userId: user.userId }),
          ),
      );
      setIsVideoMuted(
        !zoomClient.getCurrentUserInfo()?.bVideoOn,
      );

      const zoomSessionId = zoomClient.getSessionInfo()?.sessionId;
      if (isCreator && zoomSessionId) {
        await writeZoomSessionID.mutateAsync({
          zoomSessionsId: zoomSessionId,
          roomId: session,
        });
      }

      toast({
        title: "You’re in",
        description: "Your appointment is connected.",
      });
    } catch (error) {
      unregisterListeners();
      setInCall(false);
      toast({
        title: "Could not join the appointment",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const leaveCall = async () => {
    toast({ title: "Leaving appointment…" });
    unregisterListeners();

    await Promise.all(
      [...attachedVideosRef.current.keys()].map(removeAttachedVideo),
    );
    try {
      await zoomClient.leave();
    } catch (error) {
      console.error("Unable to leave Zoom session cleanly", error);
    }
    window.location.assign("/");
  };

  return (
    <div className="flex w-full flex-1 flex-col px-4 pb-8 sm:px-8">
      {!inCall && (
        <Preview
          init={init}
          onJoin={startCall}
          setIsVideoMuted={setIsVideoMuted}
          setIsAudioMuted={setIsAudioMuted}
          currentBackground={currentBackground}
          setCurrentBackground={setCurrentBackground}
        />
      )}

      <div
        className={
          inCall
            ? "mx-auto flex min-h-[32rem] w-full max-w-7xl flex-1 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-950/20"
            : "pointer-events-none fixed -left-[9999px] h-px w-px overflow-hidden"
        }
        aria-hidden={!inCall}
      >
        <video-player-container
          ref={(element: HTMLElement | null) => {
            videoContainerRef.current = element;
          }}
          className="grid h-full min-h-[32rem] w-full grid-cols-1 gap-1 bg-slate-950 sm:grid-cols-2"
        />
      </div>

      {inCall && (
        <div className="sticky bottom-5 z-20 mx-auto mt-5 flex max-w-fit items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl shadow-slate-950/10 backdrop-blur">
          <CameraButton
            client={client}
            isVideoMuted={isVideoMuted}
            setIsVideoMuted={setIsVideoMuted}
            renderVideo={renderVideo}
            currentBackground={currentBackground}
          />
          <MicButton
            isAudioMuted={isAudioMuted}
            client={client}
            setIsAudioMuted={setIsAudioMuted}
          />
          <TranscriptionButton
            setTranscriptionSubtitle={setTranscriptionSubtitle}
            client={client}
          />
          <RecordingButton client={client} />
          <SettingsModal client={client} />
          <ActionModal />
          <div className="mx-1 h-7 w-px bg-slate-200" />
          <Button
            variant="destructive"
            onClick={() => void leaveCall()}
            title="Leave appointment"
          >
            <PhoneOff />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      )}

      {isJoining && inCall && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-medium shadow-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting your appointment…
          </div>
        </div>
      )}
    </div>
  );
};

type VideoCallProps = {
  jwt: string;
  session: string;
  isCreator: boolean;
  setTranscriptionSubtitle: setTranscriptionType;
  setRecords: React.Dispatch<React.SetStateAction<ChatRecord[]>>;
  client: MutableRefObject<typeof VideoClient>;
  inCall: boolean;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

export default Videocall;
