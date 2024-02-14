import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const Notes = () => {
  const router = useRouter();
  const { roomId } = router.query;

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
      <h1 className="mb-2 mt-8 flex text-3xl font-bold leading-none text-gray-700">Notes</h1>
      <ViewNotes roomId={roomId as string} />
      <Link href="/">
        <Button variant={"link"} className="mx-auto flex">
          back
        </Button>
      </Link>
    </div>
  );
};

const ViewNotes = ({ roomId }: { roomId: string }) => {
  const { data, isLoading } = api.room.getNotesFromRoom.useQuery({ id: roomId });
  const addNote = api.room.addNote.useMutation();
  const { room } = api.useUtils();
  const [note, setNote] = useState("");

  return (
    <>
      <Card className="mt-2 min-w-96 p-8 pl-12">
        {isLoading ? <Skeleton /> : <></>}
        {data?.length !== 0 ? (
          <ul>
            {data?.map((note) => (
              <li className="list-item list-disc" key={note.id}>
                {note.createdAt.toDateString().split(" ").slice(1, 3).join(" ")}: {note.content}
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes</p>
        )}
      </Card>
      <Card className="my-2 min-w-96 p-8">
        <div className="mb-4 flex flex-col">
          <Label htmlFor="note" className="font-bold">
            Note
          </Label>
          <textarea className="min-h-32 rounded-sm border-2 p-1" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {addNote.status !== "idle" ? <p>{addNote.status}</p> : <></>}
        <Button
          className="mt-4 w-full"
          onClick={async () => {
            await addNote.mutateAsync({ roomId, content: note });
            setNote("");
            await room.getNotesFromRoom.invalidate({ id: roomId });
          }}
        >
          Add
        </Button>
      </Card>
    </>
  );
};

export { ViewNotes };
export default Notes;
