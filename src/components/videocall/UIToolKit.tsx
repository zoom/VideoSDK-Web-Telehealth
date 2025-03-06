import uitoolkit from "@zoom/videosdk-ui-toolkit";
import { useEffect, useRef } from "react";

const UIToolKit = ({setCloseToolkit}: any) => {
  const hasMounted = useRef(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const openPreview = () => {
    const preview = previewContainerRef;
    uitoolkit.openPreview(preview.current!);
    const videoContainer = document.querySelector('video-player-container');
    console.log('from UIKIT', videoContainer)
    setCloseToolkit(() => () => {
      try{
        console.log("EXECUTING")
        uitoolkit.closePreview(preview.current!)
      } catch(e){
        console.log("Error closing uitoolkit preview", e);
      }
    });
  };

  useEffect(() => {
    if (!hasMounted.current) {
      openPreview();
      console.log("RUNNING")
    }

    return () => { hasMounted.current = true; }
  }, []);
  return <div id="preview" className="mb-8 mt-8 flex flex-1 self-center" ref={previewContainerRef} />;
};

export default UIToolKit;
