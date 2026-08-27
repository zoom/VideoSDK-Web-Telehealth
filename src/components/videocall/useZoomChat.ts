import { type ChatMessage } from "@zoom/videosdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { getZoomClient } from "~/lib/zoom-video";

export const useZoomChat = (onMessage?: (message: ChatMessage) => void) => {
  const client = getZoomClient();
  const [records, setRecords] = useState<ChatMessage[]>([]);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const handleMessage = (message: ChatMessage) => {
      setRecords((previous) => [...previous, message]);
      onMessageRef.current?.(message);
    };

    client.on("chat-on-message", handleMessage);
    return () => {
      client.off("chat-on-message", handleMessage);
    };
  }, [client]);

  const sendToAll = useCallback((message: string) => client.getChatClient().sendToAll(message), [client]);

  return { records, sendToAll };
};
