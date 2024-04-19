import React, { useCallback, useState, useRef, useLayoutEffect, type MutableRefObject } from "react";
import { type VideoClient } from "@zoom/videosdk";

const Chat = (props: { client: MutableRefObject<typeof VideoClient>; records: ChatRecord[] }) => {
  const zmClient = props.client.current;
  const records = props.records;
  const chatClient = zmClient.getChatClient();
  const [chatDraft, setChatDraft] = useState<string>("");
  const chatWrapRef = useRef<HTMLDivElement | null>(null);

  const onChatPressEnter = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      if (chatDraft) {
        void chatClient.sendToAll(chatDraft);
        setChatDraft("");
      }
    },
    [chatDraft, chatClient]
  );

  useLayoutEffect(() => {
    if (chatWrapRef.current) {
      chatWrapRef.current.scrollTo(0, chatWrapRef.current.scrollHeight);
    }
  }, [records]);

  return (
    <div className="flex h-[80vh] w-80 flex-1 flex-col">
      <div ref={chatWrapRef} className="flex-1 flex-col overflow-y-scroll pr-2">
        {records.map((record) => (
          <ChatMessageItem record={record} currentUserId={zmClient.getSessionInfo().userId} key={record.timestamp} />
        ))}
      </div>
      <textarea
        className="mt-2 h-16 w-full rounded-md border-2 border-gray-200 p-2"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            onChatPressEnter(event);
          }
        }}
        onChange={(event) => setChatDraft(event.target.value)}
        value={chatDraft}
        placeholder="Type a message, hit enter to send..."
      />
    </div>
  );
};

const ChatMessageItem = (props: { record: ChatRecord; currentUserId: number }) => {
  const { record, currentUserId } = props;
  const { message, sender, timestamp } = record;
  const isCurrentUser = currentUserId === sender.userId;
  return (
    <div className="mt-4">
      <div className="flex flex-row items-center justify-between text-sm">
        <div className="px-1 font-bold">{isCurrentUser ? "" : sender.name.split(" ")[0]}</div>
      </div>
      <div
        className="right-0 ml-auto w-max max-w-64 rounded-md bg-blue-500 px-2 py-1 text-white"
        style={!isCurrentUser ? { backgroundColor: "rgb(243 244 246)", color: "black", marginLeft: "inherit", marginRight: 10 } : {}}
      >
        <p className="text-md break-words leading-5">{message}</p>
        <div className="mt-1 text-[10px]">{new Date(timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export interface ChatRecord {
  message?: string;
  id?: string;
  sender: {
    name: string;
    userId: number;
  };
  receiver: {
    name: string;
    userId: number;
  };
  timestamp: number;
}

export default Chat;
