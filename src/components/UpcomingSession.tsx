import { type User, type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { LinkIcon, X } from "lucide-react";
import { api } from "~/utils/api";
import RecordingModal from "./RecordingModal";
import { Avatar } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

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
    
    // <div className="mb-auto flex h-full flex-col">
    //   <div className="mb-4">
    //     <div className="relative w-full">
    //       <Button
    //         variant={"link"}
    //         onClick={async () => {
    //           const link = `${window.location.origin}/room/${rooms.id}`;
    //           await navigator.clipboard.writeText(link);
    //           toast({ title: "Copied link to clipoard", description: link });
    //         }}
    //         className="max-w-full"
    //       >
    //         <span className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{rooms.title}</span>
    //         <LinkIcon height={18} strokeWidth={3} />
    //       </Button>
    //       <Button
    //         variant={"destructive"}
    //         className="absolute right-0 m-[-8px] h-6 w-6 p-0"
    //         onClick={async () => {
    //           toast({ title: "Deleting Room", description: rooms.title });
    //           await deleteRoom.mutateAsync({ id: rooms.id });
    //           await utils.room.invalidate();              
    //         }}
    //         title="delete appointment"
    //       >
    //         <X size={18} />
    //       </Button>
    //     </div>
    //     <span className='mt-2 text-gray-500 justify-center'>
    //     <p className="text-sm ">{moment(rooms.time).local().fromNow()}</p>
    //     <p className="text-sm">{rooms.time.toString().slice(16, 21)}</p>
    //     </span>
    //   </div>
    //   <span className="items-start mt-2 text-gray-500 justify-start">
    //     {/*get doctor speciality to be dynamic*/}
    //   <p>Dr. {rooms.User_CreatedBy?.name}, Cardiology Specialist</p>
    //           <Avatar className="ml-4">
    //               <AvatarImage src={rooms?.User_CreatedBy?.image as string | undefined} alt="User Avatar" />
    //             </Avatar>   
    //     <p className="text-gray-500">Patient: {rooms.User_CreatedFor?.[0].name}</p>
    //   </span>
    //   <div className="m-auto">
      
    //     {/* {rooms.User_CreatedBy?.name ? (
    //       <p className="mb-1 text-left">
    //         <span className="font-bold">By: </span>
    //         <span>{rooms.User_CreatedBy.name}</span>
    //       </p>
    //     ) : (
    //       <></>
    //     )}
    //     {rooms.User_CreatedFor ? (
    //       <p className="mb-1 text-left">
    //         <span className="font-bold">For: </span>
    //         {rooms.User_CreatedFor.map((e) => (
    //           <span key={e.id}>{e.name} </span>
    //         ))}
    //       </p>
    //     ) : (
    //       <></>
    //     )} */}
    //     {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
    //       <>
    //         <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //           <Link href={`/viewNotes/${rooms.id}`}>
    //             <Button variant={"link"}>Notes</Button>
    //           </Link>
    //           <div className="w-2"></div>
    //           <RecordingModal roomId={rooms.id} />
    //         </div>
    //         <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //           <Link href={`/viewPatient/${rooms.User_CreatedFor[0].id}`}>
    //             <Button className="" variant={"secondary"}>
    //               Patient Details
    //             </Button>
    //           </Link>
    //         </div>
    //       </>
    //     ) : (
    //       <> </>
    //     )}
    //     <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //       <Link className="flex w-full flex-1" href={`/room/${rooms.id}`}>
    //         <Button className="flex flex-1">Join</Button>
    //       </Link>
    //     </div>
    //   </div>
    // </div>
      
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5">
           
                   <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
                   <Link className="flex w-full flex-1 text-sm text-blue-500 hover:underline" href={`/room/${rooms.id}`}>
                     Join Session
                   </Link>
                     </div>
          <Button
            // variant={"destructive"}
            className="absolute right"
            onClick={async () => {
              toast({ title: "Deleting Room", description: rooms.title });
              await deleteRoom.mutateAsync({ id: rooms.id });
              await utils.room.invalidate();              
            }}
            title="Cancel appointment"
          >
           Cancel Session
          </Button>
          <div className="p-8 flex items-center">
              <div className="items-start">
              <p className=" pr-4 bg-blue-200 p-2 rounded-lg text-center text-4xl font-bold text-white">{rooms.time.toString().slice(4,11)}</p>
              <Link href={`/viewNotes/${rooms.id}`}>
                <Button variant={"link"}>Notes</Button>
              </Link>
              <RecordingModal roomId={rooms.id} />
              </div>
              
              <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
              
            </div>
              <div className="ml-4">
               <Button
            variant={"link"}
            onClick={async () => {
              const link = `${window.location.origin}/room/${rooms.id}`;
              await navigator.clipboard.writeText(link);
              toast({ title: "Copied link to clipoard", description: link });
            }}
            className="max-w-full"
          >
            <span className="uppercase tracking-wide text-base text-indigo-500 font-semibold">{rooms.title}</span>
            <LinkIcon height={18} strokeWidth={3} />
          </Button>
              <p className="text-sm ">{moment(rooms.time).local().fromNow()}</p>
              <p className="mt-2 text-gray-500">{rooms.time.toString().slice(16, 21)} - </p>
              <p className="mt-2 text-gray-500">Dr. {rooms.User_CreatedBy?.name}, Cardiology Specialist</p>
              {/* <Avatar className="ml-4">
                <AvatarImage src={data?.user.image as string | undefined} alt="User Avatar" />
              </Avatar>               */}
                <Link href={`/viewPatient/${rooms.User_CreatedFor?.[0].id}`} className="mt-2 text-gray-500">
                <p className="mt-2 text-grey-500 hover:text-blue-500" title='click for patient details'>Patient: {rooms.User_CreatedFor?.[0].name}</p>
                </Link>
              {/* <p className="mt-2 text-gray-500">Patient: {rooms.User_CreatedFor?.[0].name}</p> */}
                 {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
          <>
            {/* <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
              <Link href={`/viewNotes/${rooms.id}`}>
                <Button variant={"link"}>Notes</Button>
              </Link>
              <div className="w-2"></div>
              <RecordingModal roomId={rooms.id} />
            </div> */}
          </>
        ) : (
          <> </>
        )}
            </div>
          </div>
        </div>
  );
};

export default UpcomingSession;
