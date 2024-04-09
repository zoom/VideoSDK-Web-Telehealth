import { useSession } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type MutableRefObject, useEffect, useState } from "react";
import type { VideoClient } from "@zoom/videosdk";
import { MessageCircleMore, MessageCircleOff } from 'lucide-react';


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

const Chat = (props: {client: MutableRefObject<typeof VideoClient>}) => {
const chatClient = props.client.current.getChatClient();
const [receivers, setReceivers] = useState<ChatReceiver[]>([]);
const [chatUser, setChatUser] = useState<ChatReceiver | null>(null);
const [draft, setDraft] = useState<string>('');
const { data: userData } = useSession();

useEffect(() => {
  if (chatClient) {
    setReceivers(chatClient.getReceivers());
    console.log('chatClient', receivers)
  }
}, []); 

useEffect(() => {
  if (chatUser) {
    const index = receivers.findIndex((user) => user.userId === chatUser.userId);
    if (index === -1) {
      setChatUser(receivers[0])
    }
  } else {
    setChatUser(receivers[0]);
  }
})

const sendMessage = () => {
  if (chatUser) {
    chatClient.send(draft, chatUser.userId);
    console.log('message sent', draft)
  }
}


  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <MessageCircleMore/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Input onChange={(e) => {setDraft(e.target.value)} }></Input>
        <Button onClick={sendMessage}>
          Send
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default Chat;