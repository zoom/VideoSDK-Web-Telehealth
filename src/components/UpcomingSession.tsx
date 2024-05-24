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

  //convert to minutes to be able to check and conditionally render join session button 
  console.log(moment(rooms.time).local().fromNow())
  
return (  
   
<div>
  <div className="min-w-[680px] min-h-[8rem] bg-white shadow-lg rounded-lg w-full">
   <div className="flex items-start pt-2" >
   <p className="px-4 bg-blue-200 p-2 rounded-lg text-center text-1xl font-bold text-white mx-5">{rooms.time.toString().slice(4,7)}<br></br>{rooms.time.toString().slice(7,11)}</p>      
   <div className="min-w-[540px] bg-white">
      <div className="flex justify-start">
         <Button
            variant={"link"}
            onClick={async () => {
              const link = `${window.location.origin}/room/`;
              await navigator.clipboard.writeText(link);
              toast({ title: "Copied link to clipoard", description: link });
            }}
            className="max-w-full"
          >
            <p className="uppercase tracking-wide text-base text-indigo-500 font-semibold">{rooms.title}, with {isDoctor ? rooms.User_CreatedFor?.[0].name : rooms.User_CreatedBy?.name}</p>
            <LinkIcon height={18} strokeWidth={3} />
          </Button>            
          <small className="text-sm text-gray-700">{moment(rooms.time).local().fromNow()}</small>
         </div>
         <Link className="flex flex-1 text-sm text-blue-500 hover:underline" href={`/room/${rooms.id}`}>
              Join Session
            </Link>
         <p className="flex justify-start mt-3 text-gray-700 text-sm">
         { /* automate doctor speciality */}
         {isDoctor ? 
            <Link href={`/viewPatient/${rooms.User_CreatedFor?.[0].id}`} className="text-gray-500">
              <p className="text-grey-500 hover:text-blue-500" title='click for patient details'>Patient: {rooms.User_CreatedFor?.[0].name}</p>
            </Link>
            :  
            <p className="text-gray-500">Dr. {rooms.User_CreatedBy?.name}, Cardiology Specialist</p> 
          }
         </p>
         <div className="">
         <Link href={`/viewNotes/`}>
                <Button variant={"link"}>Notes</Button>
              </Link>
              <Link href={`/viewNotes/`}>
                <Button variant={"link"}>Recordings</Button>
              </Link>
         </div>
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
        //         <Link href={`/viewPatient/${rooms.User_CreatedFor?.[0].id}`} className="mt-2 text-gray-500">
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

export default UpcomingSession;
