import { type User, type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";

type RoomData = Room & {
  User_CreatedFor?: User[];
  User_CreatedBy?: User;
};

const UpcomingSession = ({ data, isDoctor }: { data: RoomData; isDoctor?: boolean }) => {
  const rooms = data;
  return (
    <>
      <div className="mb-4">
        <p className="mb-1 text-lg font-bold">{rooms.title}</p>
        <p className="text-sm ">(Starting in ~{moment(rooms.time).local().fromNow(true)})</p>
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
              <span key={e.id}>{e.name}, </span>
            ))}
          </p>
        ) : (
          <></>
        )}
        <div className="">
          <Link href={`/room/${rooms.id}`}>
            <Button className="mb-2 mt-4">Join</Button>
          </Link>
          {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
            <Link href={`/uploaded/${rooms.User_CreatedFor[0].id}`}>
              <Button className="mb-2 ml-2 mt-4" variant={"outline"}>
                Documents
              </Button>
            </Link>
          ) : (
            <> </>
          )}
        </div>
      </div>
    </>
  );
};

export default UpcomingSession;
