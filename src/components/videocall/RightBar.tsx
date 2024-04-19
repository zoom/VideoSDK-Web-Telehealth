import Transcipt, { type TranscriptEleType } from "~/components/videocall/Transcript";
import { useSession } from "next-auth/react";
import { type RouterOutputs } from "~/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ViewNotes } from "~/pages/viewNotes/[roomId]";
import { ViewPatient } from "~/pages/viewPatient/[userId]";
import Chat, { type ChatRecord } from "../chat/Chat";
import { type MutableRefObject } from "react";
import { type VideoClient } from "@zoom/videosdk";

const RightBar = (props: {
  transcriptionSubtitle: TranscriptEleType;
  data: RouterOutputs["room"]["getById"];
  client: MutableRefObject<typeof VideoClient>;
  records: ChatRecord[];
}) => {
  const { transcriptionSubtitle, data } = props;
  const { data: userData } = useSession();

  return userData?.user.role === "doctor" ? (
    <Tabs className="mt-2 flex flex-1 flex-col self-start">
      <TabsList defaultValue={"x"}>
        <TabsTrigger value="password">Patient Data</TabsTrigger>
        <TabsTrigger value="account">Notes</TabsTrigger>
        {Object.keys(transcriptionSubtitle).length > 0 ? <TabsTrigger value="transcript">Transcript</TabsTrigger> : <></>}
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="x">x</TabsTrigger>
      </TabsList>
      <div className="absolute right-0 z-10 mr-16 mt-12 flex rounded-md bg-white">
        <TabsContent value="password" className=" 4">
          <ViewPatient userId={data.room.User_CreatedFor[0]?.id ?? "0"} />
        </TabsContent>
        <TabsContent value="account" className="p-4">
          <ViewNotes roomId={data.room.id} />
        </TabsContent>
        <TabsContent value="transcript" className="p-4">
          <Transcipt transcriptionSubtitle={transcriptionSubtitle} />
        </TabsContent>
        <TabsContent value="chat" className="p-4">
          <Chat client={props.client} records={props.records} />
        </TabsContent>
      </div>
    </Tabs>
  ) : Object.keys(transcriptionSubtitle).length > 0 ? (
    // for patient view
    <Tabs className="mt-2 flex flex-1 flex-col self-start">
      <TabsList>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="x">x</TabsTrigger>
      </TabsList>
      <div className="absolute right-0 z-10 mr-16 mt-12 flex rounded-md bg-white">
        <TabsContent value="transcript" className="p-4">
          <Transcipt transcriptionSubtitle={transcriptionSubtitle} />
        </TabsContent>
        <TabsContent value="chat" className="p-4">
          <Chat client={props.client} records={props.records} />
        </TabsContent>
      </div>
    </Tabs>
  ) : (
    <></>
  );
};
export default RightBar;
