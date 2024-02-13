import { type Room } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UpcomingSession from "~/components/UpcomingSession";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

export default function Home() {
  const { data: createdRooms, isLoading: createdRoomsLoading } = api.room.getCreated.useQuery();
  const { data: invitedRooms, isLoading: invitedRoomsLoading } = api.room.getInvited.useQuery();

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100">
      <h1 className="my-10 flex text-center text-5xl font-bold leading-none text-gray-700">Rooms</h1>
      <h3 className="gray text-left text-2xl font-bold text-gray-700">Created</h3>
      <Rooms rooms={createdRooms} isLoading={createdRoomsLoading} />
      <h3 className="text-left text-xl font-bold text-gray-700">Invited</h3>
      <Rooms rooms={invitedRooms} isLoading={invitedRoomsLoading} />
      <Link href="/">
        <Button variant={"link"}>back</Button>
      </Link>
    </div>
  );
}

const Rooms = ({ rooms, isLoading }: { rooms?: Room[]; isLoading: boolean }) => {
  const { data } = useSession();
  return (
    <div className="mb-12 flex flex-wrap justify-center">
      {isLoading ? (
        <Card className="m-4 flex min-h-64 w-64 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">
          <Skeleton className="h-56 w-56 animate-pulse" />
        </Card>
      ) : rooms?.length === 0 ? (
        <Card className="m-4 flex min-h-64 w-64 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">No Rooms</Card>
      ) : (
        rooms?.map((room) => (
          <Card key={room.id} className="m-4 flex min-h-64 w-64 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
            <UpcomingSession data={room} isDoctor={data?.user.role === "doctor"} key={room.id} />
          </Card>
        ))
      )}
    </div>
  );
};
