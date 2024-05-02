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
        <h3 className="gray text-left text-base font-sans text-gray-700">Upcoming Appointments</h3>
        <div>
    
              <Rooms rooms={createdRoomsUpcoming} isLoading={loading1} />
 
        </div>
        <h3 className="text-left text-base font-sans text-gray-700">Past Appointments</h3>
        <div>
              <Rooms rooms={createdRoomsPast} isLoading={loading3} />
        </div>
    
        <Link href="/">
          <Button variant={"link"} className="absolute right-[50px] absolute bottom-10 right-10">back to dashboard</Button>
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
        <Card className="m-4 flex min-h-50 w-64 flex-col justify-center self-center rounded-lg bg-white p-5 text-left shadow-lg">You have no upcoming appointments.</Card>
      ) : (
        rooms?.map((room) => (
          // <Card key={room.id} className="mx-6 my-4 flex h-[28rem] w-80 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
          <div className='items-start px-2'>

            <UpcomingSession data={room} isDoctor={data?.user.role === "doctor"} key={room.id} />
        
          </div>
        ))
      )}
    </div>
  );
};
