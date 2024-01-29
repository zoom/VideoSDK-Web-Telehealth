import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

export default function Home() {
  const { data: createdRooms, isLoading } = api.room.getCreated.useQuery();
  const { data: invitedRooms, isLoading: invitedRoomsLoading } = api.room.getInvited.useQuery();

  const router = useRouter();

  return (
    <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
      <h1 className="my-10 flex text-center text-5xl font-bold leading-none text-gray-700">Rooms</h1>
      <h3 className="gray text-left text-2xl font-bold text-gray-700">Created</h3>
      <div className="mb-12 flex flex-wrap justify-center">
        {isLoading ? (
          <Card className="m-4 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
            <Skeleton className="h-full w-full animate-pulse" />
          </Card>
        ) : (
          createdRooms?.map((post) => (
            <Card key={post.id} className="m-2 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
              <CardContent className="w-full">
                <CardTitle className="mb-2 w-full">{post.title}</CardTitle>
                <p>{post.content} </p>
                <p>by: {post.name}</p>
                <p>on: {post.createdAt.toLocaleDateString()}</p>
              </CardContent>
              <Button
                className="w-full"
                onClick={async () => {
                  await router.push(`/room/${post.id}`);
                }}
              >
                Join
              </Button>
            </Card>
          ))
        )}
      </div>
      <h3 className="text-left text-xl font-bold text-gray-700">Invited</h3>
      <div className="mb-8 flex flex-wrap justify-center">
        {invitedRoomsLoading ? (
          <Card className="m-4 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
            <Skeleton className="h-full w-full animate-pulse" />
          </Card>
        ) : (
          invitedRooms?.map((post) => (
            <Card key={post.id} className="m-2 flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg">
              <CardContent className="w-full">
                <CardTitle className="mb-2 w-full">{post.title}</CardTitle>
                <p>{post.content} </p>
                <p>by: {post.name}</p>
                <p>on: {post.createdAt.toLocaleDateString()}</p>
              </CardContent>
              <Button
                className="w-full"
                onClick={async () => {
                  await router.push(`/room/${post.id}`);
                }}
              >
                Join
              </Button>
            </Card>
          ))
        )}
      </div>
      <Link href="/">
        <Button variant={"link"}>back</Button>
      </Link>
    </div>
  );
}
