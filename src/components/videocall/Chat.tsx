import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type MutableRefObject, useEffect, useState } from "react";
import type { VideoClient } from "@zoom/videosdk";
import { MessageCircleMore } from "lucide-react";

export interface ChatReceiver {
  userId: number;
  displayName: string;
  isHost?: boolean;
  isCoHost?: boolean;
}

export interface ChatRecord {
  message?: string | string[];
  id?: string;
  sender: {
    name: string;
    userId: number;
    avatar?: string;
  };
  receiver: {
    name: string;
    userId: number;
  };
  timestamp: number;
}

const Chat = (props: { client: MutableRefObject<typeof VideoClient> }) => {
  const { client } = props;
  const [receivers, setReceivers] = useState<ChatReceiver[]>([]);
  const [chatUser, setChatUser] = useState<ChatReceiver | undefined | null>(null);
  const [draft, setDraft] = useState<string>("");

  useEffect(() => {
    if (client.current.getChatClient()) {
      setReceivers(client.current.getChatClient().getReceivers());
      console.log("chatClient", receivers);
    }
  }, [client, receivers]);

  useEffect(() => {
    if (chatUser) {
      const index = receivers.findIndex((user) => user.userId === chatUser.userId);
      if (index === -1) {
        setChatUser(receivers[0]);
      }
    } else {
      setChatUser(receivers[0]);
    }
  }, [chatUser, receivers]);

  const sendMessage = async () => {
    if (chatUser) {
      await client.current.getChatClient().send(draft, chatUser.userId);
      console.log("message sent", draft);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <MessageCircleMore />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Input
          onChange={(e) => {
            setDraft(e.target.value);
          }}
        ></Input>
        <Button onClick={() => sendMessage()}>Send</Button>
      </DialogContent>
    </Dialog>
  );
};

export default Chat;
