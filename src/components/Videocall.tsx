import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";

const Videocall = (props: { jwt: string; session: string }) => {
  const isRender = useRef(0);
  const [incall, setIncall] = useState(false);
  const previewContainer = useRef<HTMLDivElement>(null);
  const sessionContainer = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isRender.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      isRender.current = 1;
    }
  }, []);

  const startCall = () => {
    setIncall(true);
    uitoolkit.closePreview(previewContainer.current!);
    uitoolkit.joinSession(sessionContainer.current!, {
      videoSDKJWT: props.jwt,
      sessionName: props.session,
      userName: data?.user.name ?? "User",
      sessionPasscode: "",
      features: ["video", "audio", "share", "chat", "users", "settings"],
    });
    uitoolkit.onSessionClosed(leaveCall);
  };

  const leaveCall = () => {
    try {
      if (!incall) {
        uitoolkit.closePreview(previewContainer.current!);
      } else {
        uitoolkit.closeSession(sessionContainer.current!);
      }
    } catch (e) {}
    void router.push("/");
  };

  return (
    <div className="flex flex-col">
      <div id="meeting" className={incall ? "mb-40 mt-8 h-[60vh] w-[60vw]" : "hidden"} ref={sessionContainer} />
      {!incall ? (
        <>
          <div id="preview" className="mb-40 mt-8 h-[60vh] w-[60vw]" ref={previewContainer} />
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
        <></>
      )}
      <Button onClick={leaveCall} className="mx-auto flex w-48" variant={"link"}>
        back
      </Button>
    </div>
  );
};

export default Videocall;
