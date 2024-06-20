import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { LinkIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import Header from "~/components/ui/header";
import Footer from "~/components/ui/footer";
import { MeetingWithLabel } from "~/components/UpcomingSession";
import { ViewNotes } from "../viewNotes/[roomId]";
import { ViewRecording } from "../viewRecordings/[roomId]";

const Home = () => {
  const router = useRouter();
  const { data, isLoading, isError, error } = api.room.getById.useQuery(
    { id: `${router.query.slug as string}` },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false }
  );
  const { toast } = useToast();
  const { data: userData } = useSession();
  const isDoctor = userData?.user.role === "doctor";

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
        <h1>Error: {error.message}</h1>
      </div>
    );
  }

  if (!isLoading && data) {
    return (
      <>
        <Header />
        <div className="relative m-0 flex min-h-screen w-full flex-1 flex-col self-center bg-gray-100 px-0 pb-8">
          <Card className="w-5xl mx-16 mt-4 flex flex-col self-center p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold uppercase tracking-wide text-blue-700">
                {data.room.title}
                {data.room.User_CreatedFor?.[0]
                  ? `, with ${data.room.User_CreatedBy?.id === userData?.user.id ? data.room.User_CreatedFor?.[0].name : data.room.User_CreatedBy?.name}`
                  : ""}
              </h1>
              <Button
                variant={"link"}
                onClick={async () => {
                  const link = `${window.location.origin}/room/`;
                  await navigator.clipboard.writeText(link);
                  toast({ title: "Copied link to clipoard", description: link });
                }}
                className="max-w-full"
              >
                <LinkIcon height={18} strokeWidth={3} />
              </Button>
            </div>
            <p className="text-left text-lg text-gray-700">{data.room.content}</p>
            <p className="text-left text-lg text-gray-700">
              {new Date(data.room.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}
            </p>
            <MeetingWithLabel roomData={data.room} />
            <br />
            {isDoctor ? <ViewNotes roomId={data.room.id} dontShowAdd /> : <></>}
            <ViewRecording roomId={data.room.id} />
            <div className="flex gap-4">
              {isDoctor ? (
                <Link href={`/viewNotes/${data.room.id}`}>
                  <Button className="p-0" variant={"link"}>
                    Notes
                  </Button>
                </Link>
              ) : (
                <></>
              )}
              <Link href={`/viewRecordings/${data.room.id}`}>
                <Button className="p-0" variant={"link"}>
                  Recordings
                </Button>
              </Link>
            </div>
            {data.room.time.getTime() > new Date().getTime() ? (
              <Link className="flex flex-1 text-sm text-blue-600 hover:underline" href={`/room/${data.room.id}`}>
                <Button variant={"default"} className="ml-0 hover:underline">
                  Join Appointment
                </Button>
              </Link>
            ) : (
              <></>
            )}
          </Card>
        </div>
        <Footer />
      </>
    );
  }
};

export default Home;
