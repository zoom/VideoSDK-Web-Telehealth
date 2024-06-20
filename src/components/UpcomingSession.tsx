import { type User, type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { LinkIcon, X } from "lucide-react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import DownloadICSButton from "./DownloadICS";

type RoomData = Room & {
  User_CreatedFor?: User[];
  User_CreatedBy?: User;
};

const UpcomingSession = ({ data }: { data: RoomData }) => {
  const rooms = data;
  const { data: userData } = useSession();
  const isDoctor = userData?.user.role === "doctor";
  const { toast } = useToast();
  const deleteRoom = api.room.delete.useMutation();
  const utils = api.useUtils();

  //convert to minutes to be able to check and conditionally render join session button
  console.log(moment(rooms.time).local().fromNow());

  return (
    <div>
      <div className="min-h-[8rem] w-full min-w-[720px] rounded-lg bg-white shadow-lg">
        <div className="flex items-start gap-4 p-4">
          <div>
            <div className="flex flex-col rounded-lg border border-blue-600 text-center text-lg">
              <div className="w-full rounded-t-md bg-blue-600 px-3 py-0.5 text-sm uppercase text-white">{rooms.time.toString().slice(4, 7)}</div>
              <div className="text-blue-600">{rooms.time.toString().slice(7, 11)}</div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {moment(rooms.time).local().hour()}:{moment(rooms.time).local().minute()}
            </div>
          </div>
          <div className="relative w-full bg-white">
            <div className="flex items-center justify-between">
              <Link href={`/roomInfo/${rooms.id}`}>
                <h4 className="text-lg font-semibold uppercase tracking-wide text-blue-700 hover:underline">
                  {rooms.title}
                  {rooms.User_CreatedFor?.[0]
                    ? `, with ${rooms.User_CreatedBy?.id === userData?.user.id ? rooms.User_CreatedFor?.[0].name : rooms.User_CreatedBy?.name}`
                    : ""}
                </h4>
              </Link>
              {/* no time shown? */}
              <Button
                variant={"link"}
                onClick={async () => {
                  const link = `${window.location.origin}/room/`;
                  await navigator.clipboard.writeText(link);
                  toast({ title: "Copied link to clipoard", description: link });
                }}
                title="Copy link to clipboard"
                className="ml-0 mr-auto hover:underline"
              >
                <LinkIcon height={18} strokeWidth={3} />
              </Button>
              <Button
                variant={"ghost"}
                className="bg-blue absolute right-2 m-[-8px] h-6 w-6 p-0"
                title="Delete appointment"
                onClick={async () => {
                  toast({ title: "Deleting Appointment", description: rooms.title });
                  await deleteRoom.mutateAsync({ id: rooms.id });
                  await utils.room.invalidate();
                }}
              >
                <X size={18} color="#1352e7" />
              </Button>
            </div>
            <MeetingWithLabel roomData={data} />
            <div className="mt-2 flex gap-4 text-sm text-gray-500">{rooms.duration} hour(s)</div>
            <div className="flex gap-4">
              {isDoctor ? (
                <Link href={`/viewNotes/${data.id}`}>
                  <Button className="p-0" variant={"link"}>
                    Notes
                  </Button>
                </Link>
              ) : (
                <></>
              )}
              <Link href={`/viewRecordings/${data.id}`}>
                <Button className="p-0" variant={"link"}>
                  Recordings
                </Button>
              </Link>
            </div>

            {data.time.getTime() > new Date().getTime() ? (
              data.time.getTime() > new Date().getTime() + 1000 * 60 * 10 ? (
                <DownloadICSButton
                  className="ml-0 flex"
                  variant="outline"
                  event={{
                    start: data.time.getTime(),
                    duration: {
                      hours: data.duration,
                    },
                    title: `${data.title}`,
                  }}
                />
              ) : (
                <Link className="flex flex-1 text-sm text-blue-600 hover:underline" href={`/room/${rooms.id}`}>
                  <Button variant={"default"} className="ml-0 hover:underline">
                    Join Appointment
                  </Button>
                </Link>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>

    // <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5">
    //   <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //     <Link className="flex w-full flex-1 text-sm text-blue-500 hover:underline px-2" href={`/room/${rooms.id}`}>
    //       Join Session
    //     </Link>
    //   </div>
    //   <button
    //     // variant={"destructive"}
    //     onClick={async () => {
    //       toast({ title: "Deleting Room", description: rooms.title });
    //       await deleteRoom.mutateAsync({ id: rooms.id });
    //       await utils.room.invalidate();
    //     }}
    //     title="Cancel appointment"
    //     className="flex w-full flex-1 text-sm text-blue-500 hover:underline px-2"
    //   >
    //    Delete/Cancel Session
    //   </button>
    //   <div className="p-8 flex items-center">
    //       <div className="items-start">
    //       <p className=" pr-4 bg-blue-200 p-2 rounded-lg text-center text-4xl font-bold text-white">{rooms.time.toString().slice(4,11)}</p>
    //       <Link href={`/viewNotes/${rooms.id}`}>
    //         <Button variant={"link"}>Notes</Button>
    //       </Link>
    //       <RecordingModal roomId={rooms.id} />
    //       </div>

    //       <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">

    //     </div>
    //       <div className="ml-4">
    //        <Button
    //     variant={"link"}
    //     onClick={async () => {
    //       const link = `${window.location.origin}/room/${rooms.id}`;
    //       await navigator.clipboard.writeText(link);
    //       toast({ title: "Copied link to clipoard", description: link });
    //     }}
    //     className="max-w-full"
    //   >
    //     <span className="uppercase tracking-wide text-base text-indigo-500 font-semibold">{rooms.title}</span>
    //     <LinkIcon height={18} strokeWidth={3} />
    //   </Button>
    //       <p className="text-sm ">{moment(rooms.time).local().fromNow()}</p>
    //       <p className="mt-2 text-gray-500">{rooms.duration} hour(s)</p>
    //       <p className="mt-2 text-gray-500">Dr. {rooms.User_CreatedBy?.name}, Cardiology Specialist</p>
    //       {/* <Avatar className="ml-4">
    //         <AvatarImage src={data?.user.image as string | undefined} alt="User Avatar" />
    //       </Avatar>               */}
    //         <Link href={`/patient/${rooms.User_CreatedFor?.[0].id}`} className="mt-2 text-gray-500">
    //         <p className="mt-2 text-grey-500 hover:text-blue-500" title='click for patient details'>Patient: {rooms.User_CreatedFor?.[0].name}</p>
    //         </Link>
    //       {/* <p className="mt-2 text-gray-500">Patient: {rooms.User_CreatedFor?.[0].name}</p> */}
    //          {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
    //   <>
    //     {/* <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //       <Link href={`/viewNotes/${rooms.id}`}>
    //         <Button variant={"link"}>Notes</Button>
    //       </Link>
    //       <div className="w-2"></div>
    //       <RecordingModal roomId={rooms.id} />
    //     </div> */}
    //   </>
    // ) : (
    //   <> </>
    // )}
    //     </div>
    //   </div>
    // </div>
  );
};

export const MeetingWithLabel = ({ roomData }: { roomData: RoomData }) => {
  const { data: userData } = useSession();
  return (
    <p className="mt-3 flex justify-start text-sm text-gray-700">
      {roomData.createByUserId === userData?.user.id ? (
        roomData.User_CreatedFor?.[0]?.role === "patient" ? (
          <Link href={`/patient/${roomData.User_CreatedFor?.[0].id}`} className="text-gray-500">
            <p className="text-grey-500 hover:text-blue-500" title="Patient details">{`Patient: ${roomData.User_CreatedFor?.[0]?.name}`}</p>
          </Link>
        ) : (
          <p>{`Doctor: ${roomData.User_CreatedFor?.[0]?.name}`}</p>
        )
      ) : roomData.User_CreatedBy?.role === "patient" ? (
        <Link href={`/patient/${roomData.User_CreatedBy.id}`} className="text-gray-500">
          <p className="text-grey-500 hover:text-blue-500" title="Patient details">{`Patient: ${roomData.User_CreatedFor?.[0]?.name}`}</p>
        </Link>
      ) : (
        <p>{`Doctor: ${roomData.User_CreatedBy?.name}`}</p>
      )}
    </p>
  );
};

export default UpcomingSession;
