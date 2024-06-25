import { type Room } from "@prisma/client";
import Link from "next/link";
import UpcomingSession from "~/components/UpcomingSession";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import Footer from "~/components/ui/footer";
import Header from "~/components/ui/header";

export default function Home() {
  const { data: createdRoomsPast, isLoading: loading1 } = api.room.getCreatedPast.useQuery();
  const { data: createdRoomsUpcoming, isLoading: loading2 } = api.room.getCreatedUpcoming.useQuery();

  const sortedCreatedRoomsUpcoming = createdRoomsUpcoming?.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const sortedCreatedRoomsPast = createdRoomsPast?.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  console.log("roomsreversed", createdRoomsPast?.sort());
  console.log("roomsforward", createdRoomsPast);

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col overflow-y-scroll bg-gray-100 px-10 pb-4">
        <div className="mx-auto max-w-[680px]">
          <h1 className="mb-4 mt-6 flex text-center font-sans text-4xl leading-none text-gray-700">Your Schedule</h1>
          <h3 className="gray text-left font-sans text-base text-gray-700">Upcoming Appointments</h3>
          <div className="">
            <Rooms rooms={sortedCreatedRoomsUpcoming} isLoading={loading2} />
          </div>
          <h3 className="text-left font-sans text-base text-gray-700">Past Appointments</h3>
          <div>
            <Rooms rooms={sortedCreatedRoomsPast} isLoading={loading1} />
          </div>

          <Link href="/">
            <Button variant={"link"} className="absolute absolute bottom-10 right-10 right-[50px]">
              back to dashboard
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

const Rooms = ({ rooms, isLoading }: { rooms?: Room[]; isLoading: boolean }) => {
  rooms?.forEach((room) => {
    console.log("room", room);
  });
  return (
    <div className="my-5 flex flex-col items-center gap-3 rounded-xl">
      {isLoading ? (
        <Card className="m-8 flex h-[28rem] w-80 min-w-[680px] flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">
          <Skeleton className="h-96 w-full animate-pulse" />
        </Card>
      ) : rooms?.length === 0 ? (
        <Card className="min-h-50 m-4 flex w-64 min-w-[680px] flex-col justify-center self-center rounded-lg bg-white p-5 text-left shadow-lg">
          You have no upcoming appointments.
        </Card>
      ) : (
        rooms?.map((room) => <UpcomingSession data={room} key={room.id} />)
      )}
    </div>
  );
};
