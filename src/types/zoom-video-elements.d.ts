import type { VideoPlayer, VideoPlayerContainer } from "@zoom/videosdk";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "video-player": DetailedHTMLProps<
        HTMLAttributes<VideoPlayer>,
        VideoPlayer
      >;
      "video-player-container": DetailedHTMLProps<
        HTMLAttributes<VideoPlayerContainer>,
        VideoPlayerContainer
      >;
    }
  }
}
