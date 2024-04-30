import { type Room } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UpcomingSession from "~/components/UpcomingSession";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";
import { Avatar } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";


export default function Home() {
  const { data: createdRoomsPast, isLoading: loading1 } = api.room.getCreatedPast.useQuery();
  const { data: createdRoomsUpcoming, isLoading: loading2 } = api.room.getCreatedUpcoming.useQuery();
  const { data: invitedRoomsPast, isLoading: loading3 } = api.room.getInvitedPast.useQuery();
  const { data: invitedRoomsUpcoming, isLoading: loading4 } = api.room.getInvitedUpcoming.useQuery();

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-left overflow-y-scroll bg-gray-100 pb-4 px-10">
        <h1 className="mb-4 mt-6 flex text-center text-4xl font-sans leading-none text-gray-700">Your Schedule</h1>
        <h3 className="gray text-left text-xl font-sans text-gray-700">Upcoming Appointments</h3>
        <div>
    
              <Rooms rooms={createdRoomsPast} isLoading={loading1} />

        </div>
        <h3 className="text-left text-xl font-sans text-gray-700">Past Appointments</h3>
        <div>
              <Rooms rooms={invitedRoomsPast} isLoading={loading3} />
        </div>
    
        <Link href="/">
          <Button variant={"link"}>back to dashboard</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}

const Rooms = ({ rooms, isLoading }: { rooms?: Room[]; isLoading: boolean }) => {
  const { data } = useSession();
  rooms?.forEach((room) => {
    console.log('room', room)
  })
  return (
    <div className="mb-4 flex">
      {isLoading ? (
        <Card className="m-8 flex h-[28rem] w-80 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">
          <Skeleton className="h-96 w-full animate-pulse" />
        </Card>
      ) : rooms?.length === 0 ? (
        <Card className="m-4 flex min-h-64 w-64 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">No Rooms</Card>
      ) : (
        rooms?.map((room) => (
          // <Card key={room.id} classNameName="mx-6 my-4 flex h-[28rem] w-80 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
          //           <div className="pr-4 bg-blue-200 p-2 rounded-lg text-center">
          //             <p className="text-4xl font-bold text-white">18th</p>
          //             <p className="text-sm text-white">November, 2023</p>
          //           </div>
          //   <UpcomingSession data={room} isDoctor={data?.user.role === "doctor"} key={room.id} />
        
          // </Card>
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5">
          <div className="p-8 flex items-center">
              <div className="pr-4 bg-blue-200 p-2 rounded-lg text-center">
              <p className="text-4xl font-bold text-white">{room.time.toString().slice(4,11)}</p>
              </div>
              <div className="ml-4">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{room.title}</div>
              <p className="mt-2 text-gray-500">{room.time.toString().slice(16, 21)} - </p>
              <p className="mt-2 text-gray-500">Dr. {room.User_CreatedBy?.name}, Cardiology Specialist</p>
              <Avatar className="ml-4">
                <AvatarImage src={data?.user.image as string | undefined} alt="User Avatar" />
              </Avatar>              
              <p className="mt-2 text-gray-500">Patient: {room.User_CreatedFor?.[0].name}</p>
              {/* <img className="h-16 w-16 rounded-full mx-auto" src="https://randomuser.me/api/portraits/women/50.jpg" alt="Patient's Image"> */}
              {/* <UpcomingSession data={room} isDoctor={data?.user.role === 'doctor'} key={room.id} /> */}
              </div>
          </div>
          </div>
        ))
      )}
    </div>
  );
};
