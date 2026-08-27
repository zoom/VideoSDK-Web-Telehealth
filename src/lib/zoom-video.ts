import ZoomVideo, { type AudioOption, type CaptureVideoOption } from "@zoom/videosdk";

export const getZoomClient = () => ZoomVideo.createClient();

let initializationPromise: Promise<unknown> | null = null;

export const initializeZoom = async () => {
  const promise = initializationPromise ?? getZoomClient().init("en-US", "Global", { patchJsMedia: true });
  initializationPromise = promise;

  try {
    await promise;
  } catch (error) {
    if (initializationPromise === promise) initializationPromise = null;
    throw error;
  }
};

export const getZoomErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
    return error.reason;
  }
  return "Please check your device permissions and try again.";
};

export const createAudioOptions = (muted: boolean, microphoneId: string, speakerId: string): AudioOption => ({
  mute: muted,
  autoStartAudioInSafari: typeof window !== "undefined" && "safari" in window,
  microphoneId: microphoneId || undefined,
  speakerId: speakerId || undefined,
});

export const createVideoOptions = (cameraId: string, background: string): CaptureVideoOption | undefined =>
  cameraId || background
    ? {
        cameraId: cameraId || undefined,
        virtualBackground: background ? { imageUrl: background } : undefined,
      }
    : undefined;

export type ZoomMediaDevices = {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};

export const getZoomMediaDevices = async (): Promise<ZoomMediaDevices> => {
  const devices = await ZoomVideo.getDevices();
  return {
    cameras: devices.filter((device) => device.kind === "videoinput"),
    microphones: devices.filter((device) => device.kind === "audioinput"),
    speakers: devices.filter((device) => device.kind === "audiooutput"),
  };
};
