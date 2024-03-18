import { type User, type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { LinkIcon, X } from "lucide-react";
import { api } from "~/utils/api";
import RecordingModal from "./RecordingModal";

type RoomData = Room & {
  User_CreatedFor?: User[];
  User_CreatedBy?: User;
};

const UpcomingSession = ({ data, isDoctor }: { data: RoomData; isDoctor?: boolean }) => {
  const rooms = data;
  const { toast } = useToast();
  const deleteRoom = api.room.delete.useMutation();
  const utils = api.useUtils();

  return (
    <div className="mb-auto flex h-full flex-col">
      <div className="mb-4">
        <div className="relative w-full">
          <Button
            variant={"link"}
            onClick={async () => {
              const link = `${window.location.origin}/room/${rooms.id}`;
              await navigator.clipboard.writeText(link);
              toast({ title: "Copied link to clipoard", description: link });
            }}
            className="max-w-full"
          >
            <span className="truncate text-2xl font-bold">{rooms.title}</span>
            <LinkIcon height={18} strokeWidth={3} />
          </Button>
          <Button
            variant={"destructive"}
            className="absolute right-0 m-[-8px] h-6 w-6 p-0"
            onClick={async () => {
              toast({ title: "Deleting Room", description: rooms.title });
              await deleteRoom.mutateAsync({ id: rooms.id });
              await utils.room.invalidate();
            }}
          >
            <X size={18} />
          </Button>
        </div>
        <p className="text-sm ">{moment(rooms.time).local().fromNow()}</p>
      </div>
      <div className="m-auto">
        <p className="mb-1 text-left">
          <span className="font-bold">Description: </span>
          <span>{rooms.content}</span>
        </p>
        <p className="mb-1 text-left">
          <span className="font-bold">Time: </span>
          <span>{moment(rooms.time).local().toDate().toLocaleString().slice(0, -3)}</span>
        </p>
        <p className="mb-1 text-left">
          <span className="font-bold">Duration: </span>
          <span>{rooms.duration} hour(s)</span>
        </p>
        {rooms.User_CreatedBy?.name ? (
          <p className="mb-1 text-left">
            <span className="font-bold">By: </span>
            <span>{rooms.User_CreatedBy.name}</span>
          </p>
        ) : (
          <></>
        )}
        {rooms.User_CreatedFor ? (
          <p className="mb-1 text-left">
            <span className="font-bold">For: </span>
            {rooms.User_CreatedFor.map((e) => (
              <span key={e.id}>{e.name} </span>
            ))}
          </p>
        ) : (
          <></>
        )}
        {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
          <>
            <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
              <Link href={`/viewNotes/${rooms.id}`}>
                <Button variant={"link"}>Notes</Button>
              </Link>
              <div className="w-2"></div>
              <RecordingModal roomId={rooms.id} />
            </div>
            <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
              <Link href={`/viewPatient/${rooms.User_CreatedFor[0].id}`}>
                <Button className="" variant={"secondary"}>
                  Patient Details
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <> </>
        )}
        <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
          <Link className="flex w-full flex-1" href={`/room/${rooms.id}`}>
            <Button className="flex flex-1">Join</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpcomingSession;
