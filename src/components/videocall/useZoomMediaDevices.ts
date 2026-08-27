import { useCallback, useEffect, useRef, useState } from "react";

import { getZoomMediaDevices, type ZoomMediaDevices } from "~/lib/zoom-video";

const emptyDevices: ZoomMediaDevices = {
  cameras: [],
  microphones: [],
  speakers: [],
};

export const useZoomMediaDevices = (loadOnMount = true) => {
  const [devices, setDevices] = useState<ZoomMediaDevices>(emptyDevices);
  const [isLoading, setIsLoading] = useState(loadOnMount);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const nextDevices = await getZoomMediaDevices();
      if (mountedRef.current) setDevices(nextDevices);
      return nextDevices;
    } catch (nextError) {
      if (mountedRef.current) setError(nextError);
      throw nextError;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (loadOnMount) {
      void Promise.resolve()
        .then(refresh)
        .catch(() => undefined);
    }

    const handleDeviceChange = () => {
      void refresh().catch(() => undefined);
    };
    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      mountedRef.current = false;
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [loadOnMount, refresh]);

  return { ...devices, isLoading, error, refresh };
};
