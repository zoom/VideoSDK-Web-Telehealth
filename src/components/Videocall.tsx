import uitoolkit from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";

const Videocall = (props: { jwt: string; session: string }) => {
  const [incall, setIncall] = useState(false);
  const ref = useRef(0);
  const previewContainer = useRef<HTMLDivElement>(null);
  const sessionContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === 0) {
      uitoolkit.openPreview(previewContainer.current!);
      ref.current = 1;
    } else {
    }
  }, []);
  return (
    <div>
      {!incall ? <div id="preview" ref={previewContainer} /> : <></>}
      <div id="meeting" ref={sessionContainer} />
      <Button
        onClick={() => {
          setIncall(true);
          uitoolkit.closePreview(previewContainer.current!);
          uitoolkit.joinSession(sessionContainer.current!, {
            videoSDKJWT: props.jwt,
            sessionName: props.session,
            userName: "UserA",
            sessionPasscode: "",
            features: ["video", "audio", "share", "chat", "users", "settings"],
          });
        }}
      >
        Join
      </Button>
    </div>
  );
};

export default Videocall;
