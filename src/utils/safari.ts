import { type VideoClient } from "@zoom/videosdk";

// For safari desktop browsers, you need to start audio after the media-sdk-change event is triggered
export const WorkAroundForSafari = async (client: typeof VideoClient) => {
  let audioDecode: boolean;
  let audioEncode: boolean;
  client.on("media-sdk-change", (payload) => {
    console.log("media-sdk-change", payload);
    if (payload.type === "audio" && payload.result === "success") {
      if (payload.action === "encode") {
        audioEncode = true;
      } else if (payload.action === "decode") {
        audioDecode = true;
      }
      if (audioEncode && audioDecode) {
        console.log("start audio");
        void client.getMediaStream().startAudio();
      }
    }
  });
};
