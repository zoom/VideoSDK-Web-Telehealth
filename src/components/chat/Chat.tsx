import { type ChatMessage } from "@zoom/videosdk";
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { getZoomClient } from "~/lib/zoom-video";

const Chat = ({ records, sendToAll }: ChatProps) => {
  const [chatDraft, setChatDraft] = useState<string>("");
  const chatWrapRef = useRef<HTMLDivElement | null>(null);

  const onChatPressEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    if (chatDraft) {
      void sendToAll(chatDraft);
      setChatDraft("");
    }
  };

  useLayoutEffect(() => {
    if (chatWrapRef.current) {
      chatWrapRef.current.scrollTo(0, chatWrapRef.current.scrollHeight);
    }
  }, [records]);

  return (
    <div className="flex h-[80vh] w-80 flex-1 flex-col">
      <div ref={chatWrapRef} className="flex-1 flex-col overflow-y-scroll pr-2">
        {records.map((record) => (
          <ChatMessageItem record={record} currentUserId={getZoomClient().getSessionInfo().userId} key={record.timestamp} />
        ))}
      </div>
      <label htmlFor="chat-message" className="mt-2 text-sm font-medium">
        Message
      </label>
      <textarea
        id="chat-message"
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
        <p className="text-md leading-5 break-words">{message}</p>
        <div className="mt-1 text-[10px]">{new Date(timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

type ChatProps = {
  records: ChatRecord[];
  sendToAll: (message: string) => Promise<unknown>;
};

export type ChatRecord = ChatMessage;

export default Chat;
