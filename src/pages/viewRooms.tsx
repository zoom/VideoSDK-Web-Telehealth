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

export default function Home() {
  const { data: createdRoomsPast, isLoading: loading1 } = api.room.getCreatedPast.useQuery();
  const { data: createdRoomsUpcoming, isLoading: loading2 } = api.room.getCreatedUpcoming.useQuery();
  const { data: invitedRoomsPast, isLoading: loading3 } = api.room.getInvitedPast.useQuery();
  const { data: invitedRoomsUpcoming, isLoading: loading4 } = api.room.getInvitedUpcoming.useQuery();

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center overflow-y-scroll bg-gray-100 pb-4">
        <h1 className="mb-4 mt-6 flex text-center text-5xl font-bold leading-none text-gray-700">Rooms</h1>
        <h3 className="gray text-left text-2xl font-bold text-gray-700">Created</h3>
        <div>
          <Tabs defaultValue="account" className="mt-2 flex w-full flex-col self-center">
            <TabsList>
              <TabsTrigger value="password">Past</TabsTrigger>
              <TabsTrigger value="account">Upcoming</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Rooms rooms={createdRoomsPast} isLoading={loading1} />
            </TabsContent>
            <TabsContent value="account">
              <Rooms rooms={createdRoomsUpcoming} isLoading={loading2} />
            </TabsContent>
          </Tabs>
        </div>
        <h3 className="text-left text-xl font-bold text-gray-700">Invited</h3>
        <div>
          <Tabs defaultValue="account" className="mt-2 flex w-full flex-col self-center">
            <TabsList>
              <TabsTrigger value="password">Past</TabsTrigger>
              <TabsTrigger value="account">Upcoming</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Rooms rooms={invitedRoomsPast} isLoading={loading3} />
            </TabsContent>
            <TabsContent value="account">
              <Rooms rooms={invitedRoomsUpcoming} isLoading={loading4} />
            </TabsContent>
          </Tabs>
        </div>
        <Link href="/">
          <Button variant={"link"}>back</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}

const Rooms = ({ rooms, isLoading }: { rooms?: Room[]; isLoading: boolean }) => {
  const { data } = useSession();
  return (
    <div className="mb-4 flex flex-wrap justify-center">
      {isLoading ? (
        <Card className="m-8 flex h-[28rem] w-80 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">
          <Skeleton className="h-96 w-full animate-pulse" />
        </Card>
      ) : rooms?.length === 0 ? (
        <Card className="m-4 flex min-h-64 w-64 flex-col justify-center self-center rounded-lg bg-white p-5 text-center shadow-lg">No Rooms</Card>
      ) : (
        rooms?.map((room) => (
          <Card key={room.id} className="mx-6 my-4 flex h-[28rem] w-80 flex-col self-center rounded-lg bg-white p-5 text-center shadow-lg">
            <UpcomingSession data={room} isDoctor={data?.user.role === "doctor"} key={room.id} />
          </Card>
        ))
      )}
    </div>
  );
};
