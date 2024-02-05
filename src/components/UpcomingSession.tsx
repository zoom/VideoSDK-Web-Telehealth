import { type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";

const UpcomingSession = ({ data, isDoctor }: { data: Room; isDoctor?: boolean }) => {
  return (
    <>
      <div className="mb-4">
        <p className="mb-1 text-lg font-bold">{data.title}</p>
        <p className="text-sm ">(Starting in ~{moment(data.time).local().fromNow(true)})</p>
      </div>
      <div className="m-auto">
        <p className="mb-1 text-left">
          <span className="font-bold">Description: </span>
          <span>{data.content}</span>
        </p>
        <p className="mb-1 text-left">
          <span className="font-bold">Time: </span>
          <span>{moment(data.time).local().toDate().toLocaleString().slice(0, -3)}</span>
        </p>
        <p className="mb-1 text-left">
          <span className="font-bold">Duration: </span>
          <span>{data.duration} hour(s)</span>
        </p>
        <div className="">
          <Link href={`/room/${data.id}`}>
            <Button className="mb-2 mt-4">Join</Button>
          </Link>
          {isDoctor ? (
            <Link href={`/uploaded/${data.id}`}>
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
