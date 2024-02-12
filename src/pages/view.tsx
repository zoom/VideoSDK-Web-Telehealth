import { type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
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
  const router = useRouter();
  return (
    <div className="mb-12 flex flex-wrap justify-center">
      {isLoading ? (
        <Card className="m-4 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
          <Skeleton className="h-full w-full animate-pulse" />
        </Card>
      ) : rooms?.length === 0 ? (
        <>
          <Card className="m-4 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">No Rooms</Card>
        </>
      ) : (
        rooms?.map((room) => (
          <Card key={room.id} className="m-2 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
            <CardContent className="w-full">
              <CardTitle className="mb-2 w-full">{room.title}</CardTitle>
              <p>{room.content} </p>
              <p>on: {moment(room.time).local().toLocaleString()}</p>
            </CardContent>
            <Button
              className="w-full"
              onClick={async () => {
                await router.push(`/room/${room.id}`);
              }}
            >
              Join
            </Button>
          </Card>
        ))
      )}
    </div>
  );
};
